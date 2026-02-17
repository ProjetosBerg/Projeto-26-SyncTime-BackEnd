import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { GetByUserIdMonthlyRecordUseCaseProtocol } from "@/data/usecases/interfaces/monthlyRecord/getByUserIdMonthlyRecordUseCaseProtocol";
import { MonthlyRecordMock } from "@/domain/models/postgres/MonthlyRecordModel";
import { getByUserIdMonthlyRecordValidationSchema } from "@/data/usecases/validation/monthlyRecord/getByUserIdMonthlyRecordValidationSchema";

/**
 * Recupera todos os registros mensais de um usuário específico
 *
 * @param {GetByUserIdMonthlyRecordUseCaseProtocol.Params} data - Os dados de entrada contendo o ID do usuário
 * @param {string} data.userId - O ID do usuário cujos registros mensais devem ser recuperados
 *
 * @returns {Promise<MonthlyRecordMock[]>} A lista de registros mensais
 *
 * @throws {ValidationError} Se o userId fornecido for inválido
 * @throws {NotFoundError} Se o usuário não for encontrado
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByUserIdMonthlyRecordUseCase
  implements GetByUserIdMonthlyRecordUseCaseProtocol
{
  constructor(
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByUserIdMonthlyRecordUseCaseProtocol.Params
  ): Promise<{ records: MonthlyRecordMock[]; total: number }> {
    try {
      await getByUserIdMonthlyRecordValidationSchema.validate(data, {
        abortEarly: false,
      });
      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const { records: monthlyRecords, total } =
        await this.monthlyRecordRepository.findByUserId({
          userId: data.userId,
          categoryId: data.categoryId,
          page: data.page || 1,
          limit: data.limit || 10,
          sortBy: data.sortBy || "title",
          order: data.order || "ASC",
          filters: data.filters || [],
        });

      return { records: monthlyRecords, total };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(
        `Falha na busca dos registros mensais: ${errorMessage}`
      );
    }
  }
}
