import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { CreateCustomFieldUseCaseProtocol } from "@/data/usecases/interfaces/customFields/createCustomFieldUseCaseProtocol";
import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";
import { createCustomFieldValidationSchema } from "@/data/usecases/validation/customFields/createCustomFieldValidationSchema";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

/**
 * Cria um campo personalizado para um usuário específico
 *
 * @param {CreateCustomFieldUseCaseProtocol.Params} data - Os dados de entrada para a criação do campo personalizado
 * @param {string} data.type - O tipo do campo personalizado (ex.: texto, número, seleção)
 * @param {string} data.label - O rótulo (label) do campo personalizado
 * @param {string} [data.description] - A descrição do campo personalizado (opcional)
 * @param {string} data.category_id - O ID da categoria associada ao campo personalizado
 * @param {number[]} data.record_type_id - Os IDs dos tipos de registro associados ao campo personalizado
 * @param {string} data.name - O nome único do campo personalizado
 * @param {boolean} data.required - Indica se o campo personalizado é obrigatório
 * @param {string} data.user_id - O ID do usuário proprietário do campo personalizado
 * @param {string[]} [data.options] - As opções do campo personalizado (obrigatório para o tipo SELECT)
 *
 * @returns {Promise<CustomFieldModel>} O campo personalizado criado
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário ou a categoria não forem encontrados
 * @throws {BusinessRuleError} Se já existir um campo personalizado com o mesmo nome para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a criação
 */

export class CreateCustomFieldUseCase
  implements CreateCustomFieldUseCaseProtocol
{
  constructor(
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol
  ) {}

  async handle(
    data: CreateCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel> {
    try {
      await createCustomFieldValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const category = await this.categoryRepository.findByIdAndUserId({
        id: data.categoryId,
        userId: data.userId,
      });
      if (!category) {
        throw new NotFoundError(
          `Categoria com ID ${data.categoryId} não encontrada para este usuário`
        );
      }

      const existingCustomField =
        await this.customFieldsRepository.findByNameAndUserId({
          name: data.name,
          user_id: data.userId,
        });
      if (existingCustomField) {
        throw new BusinessRuleError(
          `Já existe um campo personalizado com o nome ${data.name} para este usuário`
        );
      }

      const customField = await this.customFieldsRepository.create({
        type: data.type as FieldType,
        label: data.label,
        description: data.description,
        category_id: data.categoryId,
        record_type_id: data.recordTypeId,
        name: data.name,
        required: data.required,
        user_id: data.userId,
        options: data.options,
      });

      return customField;
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
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(
        `Falha no cadastro do campo personalizado: ${errorMessage}`
      );
    }
  }
}
