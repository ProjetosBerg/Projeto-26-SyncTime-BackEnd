import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { EditCustomFieldUseCaseProtocol } from "@/data/usecases/interfaces/customFields/editCustomFieldUseCaseProtocol";
import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";
import { editCustomFieldValidationSchema } from "@/data/usecases/validation/customFields/editCustomFieldValidationSchema";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

/**
 * Atualiza um campo personalizado existente para um usuário específico
 *
 * @param {EditCustomFieldUseCaseProtocol.Params} data - Os dados de entrada para atualizar o campo personalizado
 * @param {string} data.id - O ID do campo personalizado a ser atualizado
 * @param {string} data.user_id - O ID do usuário proprietário do campo personalizado
 * @param {string} [data.type] - O novo tipo do campo personalizado (opcional)
 * @param {string} [data.label] - O novo rótulo do campo personalizado (opcional)
 * @param {string} [data.name] - O novo nome único do campo personalizado (opcional)
 * @param {string} [data.category_id] - O novo ID da categoria (opcional)
 * @param {string | null} [data.description] - A nova descrição (opcional)
 * @param {Array<{ value: string; recordTypeIds: number[] }> | null} [data.options] - As novas opções para tipo MULTIPLE (opcional)
 * @param {number[]} [data.record_type_id] - Os novos IDs dos tipos de registro associados (opcional)
 * @param {boolean} [data.required] - Indica se o campo personalizado é obrigatório (opcional)
 *
 * @returns {Promise<CustomFieldModel>} O campo personalizado atualizado
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, a categoria ou o campo personalizado não forem encontrados
 * @throws {BusinessRuleError} Se o novo nome já existir em outro campo personalizado do mesmo usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a atualização
 */

export class EditCustomFieldUseCase implements EditCustomFieldUseCaseProtocol {
  constructor(
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol
  ) {}

  async handle(
    data: EditCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel> {
    try {
      await editCustomFieldValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({
        id: data.userId,
      });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const customField = await this.customFieldsRepository.findByIdAndUserId({
        id: data.customFieldsId,
        user_id: data.userId,
      });
      if (!customField) {
        throw new NotFoundError(
          `Campo personalizado com ID ${data.customFieldsId} não encontrado para este usuário`
        );
      }

      if (data.categoryId) {
        const category = await this.categoryRepository.findByIdAndUserId({
          id: data.categoryId,
          userId: data.userId,
        });
        if (!category) {
          throw new NotFoundError(
            `Categoria com ID ${data.categoryId} não encontrada para este usuário`
          );
        }
      }

      if (data?.name && data?.name !== customField?.name) {
        const existingCustomField =
          await this.customFieldsRepository.findByNameAndUserId({
            name: data.name,
            user_id: data.userId,
          });
        if (
          existingCustomField &&
          existingCustomField.id !== data.customFieldsId
        ) {
          throw new BusinessRuleError(
            `Já existe um campo personalizado com o nome ${data.name} para este usuário`
          );
        }
      }

      let options = data.options;
      if (data.type && data.type !== FieldType.MULTIPLE) {
        options = null;
      } else if (!data.type && customField.type !== FieldType.MULTIPLE) {
        options = null;
      }

      const updatedCustomField = await this.customFieldsRepository.update({
        id: data.customFieldsId,
        user_id: data.userId,
        type: data.type as FieldType,
        label: data.label,
        name: data.name,
        category_id: data.categoryId,
        description: data.description,
        options,
        record_type_id: data.recordTypeId,
        required: data.required,
      });

      return updatedCustomField;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (
        error instanceof BusinessRuleError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a atualização";
      throw new ServerError(
        `Falha na atualização de campo personalizado: ${errorMessage}`
      );
    }
  }
}
