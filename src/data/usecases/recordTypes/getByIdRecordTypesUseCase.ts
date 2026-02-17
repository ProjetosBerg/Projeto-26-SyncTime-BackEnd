import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { GetByIdRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/getByIdRecordTypeUseCaseProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { getByIdRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/getByIdRecordTypeValidationSchema";

/**
 * Recupera um tipo de registro pelo seu ID para um usuário específico
 *
 * @param {GetByIdRecordTypeUseCaseProtocol.Params} data - Os dados de entrada contendo o ID do tipo de registro e o ID do usuário
 * @param {number} data.recordTypeId - O ID do tipo de registro a ser recuperado
 * @param {string} data.userId - O ID do usuário proprietário do tipo de registro
 *
 * @returns {Promise<RecordTypeModel>} Uma promessa que retorna o tipo de registro
 *
 * @throws {ValidationError} Se o id ou user_id fornecido for inválido
 * @throws {BusinessRuleError} Se nenhum tipo de registro for encontrado para o ID e usuário informados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByIdRecordTypeUseCase
  implements GetByIdRecordTypeUseCaseProtocol
{
  constructor(
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel> {
    try {
      await getByIdRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });

      const recordType = await this.recordTypeRepository.findByIdRecordType({
        id: data.recordTypeId,
        userId: data.userId,
      });

      if (!recordType) {
        throw new BusinessRuleError(
          `Nenhum tipo de registro encontrado com o ID ${data.recordTypeId} para este usuário`
        );
      }

      return recordType;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de record type: ${errorMessage}`);
    }
  }
}
