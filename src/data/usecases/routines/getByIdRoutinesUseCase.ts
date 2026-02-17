import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";

import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { RoutineModel } from "@/domain/models/postgres/RoutinModel";
import { GetByIdRoutinesUseCaseProtocol } from "../interfaces/routines/getByIdRoutinesUseCaseProtocol";
import { getByIdRoutinesValidationSchema } from "../validation/routines/getByIdRoutinesValidationSchema";

/**
 * Busca uma rotina por ID e ID do usuário
 *
 * @param {GetByIdRoutinesUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.routineId - O ID da rotina
 * @param {string} data.userId - O ID do usuário proprietário da rotina
 *
 * @returns {Promise<RoutineModel>} A rotina encontrada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se a rotina não for encontrada para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByIdRoutinesUseCase implements GetByIdRoutinesUseCaseProtocol {
  constructor(
    private readonly routinesRepository: RoutinesRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdRoutinesUseCaseProtocol.Params
  ): Promise<RoutineModel> {
    try {
      await getByIdRoutinesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const routine = await this.routinesRepository.findByIdAndUserId({
        id: data.routineId,
        userId: data.userId,
      });

      if (!routine) {
        throw new NotFoundError(
          `Rotina com ID ${data.routineId} não encontrada para este usuário`
        );
      }

      return routine;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de rotina: ${errorMessage}`);
    }
  }
}
