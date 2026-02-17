import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { GetByUserIdRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/getByUserIdRecordTypeUseCaseProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { getByUserIdRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/getByUserIdRecordTypeValidationSchema";

/**
 * Recupera todos os tipos de registros de um usuário específico
 *
 * @param {GetByUserIdRecordTypeUseCaseProtocol.Params} data - Os dados de entrada contendo o ID do usuário
 * @param {string} data.userId - O ID do usuário cujos tipos de registros devem ser recuperados
 *
 * @returns {Promise<RecordTypeModel[]>} Uma promessa que retorna um array com os tipos de registros do usuário
 *
 * @throws {ValidationError} Se o userId fornecido for inválido
 * @throws {BusinessRuleError} Se nenhum tipo de registro for encontrado para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação dos dados
 */

export class GetByUserIdRecordTypeUseCase
  implements GetByUserIdRecordTypeUseCaseProtocol
{
  constructor(
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(
    data: GetByUserIdRecordTypeUseCaseProtocol.Params
  ): Promise<{ recordTypes: RecordTypeModel[]; total: number }> {
    try {
      await getByUserIdRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });

      const { recordTypes, total } =
        await this.recordTypeRepository.findByUserId({
          userId: data?.userId,
          page: data.page || 1,
          limit: data.limit || 10,
          search: data.search,
          sortBy: data.sortBy || "name",
          order: data.order || "ASC",
        });

      if (recordTypes?.length === 0) {
        throw new BusinessRuleError(
          "Nenhum tipo de registro encontrado para este usuário"
        );
      }

      return { recordTypes, total };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de record types: ${errorMessage}`);
    }
  }
}
