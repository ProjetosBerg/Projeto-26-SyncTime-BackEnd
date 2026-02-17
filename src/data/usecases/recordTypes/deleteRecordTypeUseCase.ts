import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { deleteRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/deleteRecordTypeValidationSchema";
import { DeleteRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/deleteRecordTypeUseCaseProtocol";

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
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(data: DeleteRecordTypeUseCaseProtocol.Params): Promise<any> {
    try {
      await deleteRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });

      await this.recordTypeRepository.deleteRecordTypes({
        id: data.recordTypeId,
        userId: data.userId,
      });
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
