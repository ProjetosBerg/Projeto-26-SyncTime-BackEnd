import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { EditRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/editRecordTypeUseCaseProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { editRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/editRecordTypeValidationSchema";

/**
 * Atualiza um tipo de registro existente para um usuário específico
 *
 * @param {EditRecordTypeUseCaseProtocol.Params} data - Os dados de entrada contendo as informações do tipo de registro
 * @param {number} data.recordTypeId - O ID do tipo de registro que será atualizado
 * @param {string} data.userId - O ID do usuário proprietário do tipo de registro
 * @param {string} data.name - O novo nome do tipo de registro
 * @param {string} data.icone - O novo ícone do tipo de registro
 *
 * @returns {Promise<RecordTypeModel>} O tipo de registro atualizado
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {BusinessRuleError} Se o tipo de registro não for encontrado ou se o novo nome já existir para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a atualização
 */

export class EditRecordTypeUseCase implements EditRecordTypeUseCaseProtocol {
  constructor(
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(
    data: EditRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel> {
    try {
      await editRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingRecordType =
        await this.recordTypeRepository.findByIdRecordType({
          id: data.recordTypeId,
          userId: data.userId,
        });

      if (!existingRecordType) {
        throw new BusinessRuleError(
          `Nenhum tipo de registro encontrado com o ID ${data.recordTypeId} para este usuário`
        );
      }

      if (data?.name && data?.name !== existingRecordType.name) {
        const duplicateRecordType =
          await this.recordTypeRepository.findByNameAndUserId({
            name: data.name,
            userId: data.userId,
          });

        if (
          duplicateRecordType &&
          duplicateRecordType.id !== data.recordTypeId
        ) {
          throw new BusinessRuleError(
            `Já existe um tipo de registro com o nome "${data.name}" para este usuário`
          );
        }
      }

      const updatedRecordType =
        await this.recordTypeRepository.updateRecordTypes({
          id: data.recordTypeId,
          userId: data.userId,
          name: data.name,
          icone: data.icone,
        });

      return updatedRecordType;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a edição";
      throw new ServerError(`Falha ao editar do record type: ${errorMessage}`);
    }
  }
}
