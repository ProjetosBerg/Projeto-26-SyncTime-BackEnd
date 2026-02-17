import { ServerError } from "@/data/errors/ServerError";
import { UserMonthlyEntryRankRepositoryProtocol } from "@/infra/db/interfaces/userMonthlyEntryRankRepositoryProtocol";
import { GetByUserIdRankUserUseCaseProtocol } from "../interfaces/users/getByUserIdRankUserUseCaseProtocol";
import { getByUserIdRankUserValidationSchema } from "../validation/users/getByUserIdRankUserValidationSchema";

/**
 * Busca os 10 primeiros ranqueados e o rank do usuário atual para um mês/ano específico
 *
 * @param {GetByUserIdRankUserUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.userId - O ID do usuário
 * @param {number} data.year - O ano do rank
 * @param {number} data.month - O mês do rank (1-12)
 *
 * @returns {Promise<{ top10: { userId: string; totalEntries: number; rank: number }[]; myRank: { userId: string; totalEntries: number; rank: number | undefined } | undefined }>} Os 10 primeiros e o rank do usuário
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByUserIdRankUserUseCase
  implements GetByUserIdRankUserUseCaseProtocol
{
  constructor(
    private readonly userMonthlyEntryRankRepository: UserMonthlyEntryRankRepositoryProtocol
  ) {}

  async handle(data: GetByUserIdRankUserUseCaseProtocol.Params): Promise<{
    top10: { userId: string; totalEntries: number; rank: number }[];
    myRank:
      | { userId: string; totalEntries: number; rank: number | undefined }
      | undefined;
  }> {
    try {
      const validatedData = await getByUserIdRankUserValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      const { rankedUsers: top10 } =
        await this.userMonthlyEntryRankRepository.getAllRankedForMonthPaginated(
          {
            year: validatedData!.year,
            month: validatedData!.month,
            page: 1,
            limit: 10,
            order: "DESC",
          }
        );

      const userInTop10 = top10.find((r) => r.userId === validatedData!.userId);

      if (userInTop10) {
        return {
          top10,
          myRank: undefined,
        };
      }

      const userRankRecord =
        await this.userMonthlyEntryRankRepository.findOneRankUser({
          userId: validatedData!.userId,
          year: validatedData!.year,
          month: validatedData!.month,
        });

      let myRank;
      if (userRankRecord) {
        const rank =
          await this.userMonthlyEntryRankRepository.getUserRankForMonth({
            userId: validatedData!.userId,
            year: validatedData!.year,
            month: validatedData!.month,
          });
        myRank = {
          userId: userRankRecord.userId,
          totalEntries: userRankRecord.totalEntries,
          rank,
        };
      }

      return {
        top10,
        myRank,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(
        `Falha na busca de rank do usuário: ${errorMessage}`
      );
    }
  }
}
