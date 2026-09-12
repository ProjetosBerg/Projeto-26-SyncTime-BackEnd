import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { deleteRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/deleteRecordTypeValidationSchema";
import { DeleteRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/deleteRecordTypeUseCaseProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import logger from "@/loaders/logger";

/**
 * Exclui um tipo de registro de um usuário específico
 *
 * @param {DeleteRecordTypeUseCaseProtocol.Params} data - Os dados de entrada contendo o ID do tipo de registro e o ID do usuário
 * @param {number} data.recordTypeId - O ID do tipo de registro a ser excluído
 * @param {string} data.userId - O ID do usuário proprietário do tipo de registro
 *
 * @returns {Promise<void>} Uma promessa que é resolvida quando o tipo de registro é excluído
 *
 * @throws {ValidationError} Se o id ou user_id fornecido for inválido
 * @throws {BusinessRuleError} Se o tipo de registro não for encontrado
 * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
 */

export class DeleteRecordTypeUseCase
  implements DeleteRecordTypeUseCaseProtocol
{
  constructor(
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol,
    private readonly customFieldsRepository?: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository?: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: DeleteRecordTypeUseCaseProtocol.Params): Promise<any> {
    try {
      await deleteRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });
      const recordTypeId = Number(data.recordTypeId);
      const userId = String(data.userId);

      await this.recordTypeRepository.deleteRecordTypes({
        id: recordTypeId,
        userId,
      });

      try {
        const customFieldIds =
          (await this.customFieldsRepository?.deleteByRecordTypeId?.({
            record_type_id: recordTypeId,
            user_id: userId,
          })) || [];
        await this.transactionCustomFieldRepository?.deleteByCustomFieldIds?.({
          custom_field_ids: customFieldIds,
          user_id: userId,
        });
      } catch (cleanupError) {
        logger.error(
          `Tipo de registro ${recordTypeId} excluído do PostgreSQL, mas houve falha na limpeza do MongoDB: ${
            cleanupError instanceof Error
              ? cleanupError.message
              : String(cleanupError)
          }`
        );
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a edição";
      throw new ServerError(`Falha ao deletar record type: ${errorMessage}`);
    }
  }
}
