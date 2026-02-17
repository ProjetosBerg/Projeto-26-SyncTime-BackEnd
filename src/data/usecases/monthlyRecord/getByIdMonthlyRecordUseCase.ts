import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import {
  MonthlyRecordModel,
  MonthlyRecordMock,
} from "@/domain/models/postgres/MonthlyRecordModel";
import { GetByIdMonthlyRecordUseCaseProtocol } from "../interfaces/monthlyRecord/getByIdMonthlyRecordUseCaseProtocol";
import { getByIdMonthlyRecordValidationSchema } from "../validation/monthlyRecord/getByIdMonthlyRecordValidationSchema";

/**
 * Recupera um registro mensal pelo seu ID para um usuário específico
 *
 * @param {GetByIdMonthlyRecordUseCaseProtocol.Params} data - Os dados de entrada para a recuperação do registro mensal
 * @param {string} data.monthlyRecordId - O ID do registro mensal a ser recuperado
 * @param {string} data.userId - O ID do usuário proprietário do registro mensal
 *
 * @returns {Promise<MonthlyRecordMock>} O registro mensal recuperado
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário ou o registro mensal não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByIdMonthlyRecordUseCase
  implements GetByIdMonthlyRecordUseCaseProtocol
{
  constructor(
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdMonthlyRecordUseCaseProtocol.Params
  ): Promise<MonthlyRecordMock> {
    try {
      await getByIdMonthlyRecordValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: data.monthlyRecordId,
          userId: data.userId,
        });

      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${data.monthlyRecordId} não encontrado para este usuário`
        );
      }

      return monthlyRecord;
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
        `Falha na busca do registro mensal: ${errorMessage}`
      );
    }
  }
}
