import { ServerError } from "@/data/errors/ServerError";
import { GetByUserIdRoutinesUseCaseProtocol } from "@/data/usecases/interfaces/routines/getByUserIdRoutinesUseCaseProtocol";
import { getByUserIdRoutinesValidationSchema } from "@/data/usecases/validation/routines/getByUserIdRoutinesValidationSchema";
import { RoutineModel } from "@/domain/models/postgres/RoutinModel";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";

/**
 * Busca rotinas por ID do usuário com paginação e filtros
 *
 * @param {GetByUserIdRoutinesUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.userId - O ID do usuário proprietário das rotinas
 * @param {number} [data.page] - Página atual (padrão: 1)
 * @param {number} [data.limit] - Limite de registros por página (padrão: 10)
 * @param {string} [data.search] - Termo de busca no tipo da rotina
 * @param {string} [data.sortBy] - Campo para ordenação (padrão: "type")
 * @param {string} [data.order] - Direção da ordenação ("ASC" ou "DESC")
 *
 * @returns {Promise<{ routines: RoutineModel[]; total: number }>} Lista de rotinas e total de registros
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByUserIdRoutinesUseCase
  implements GetByUserIdRoutinesUseCaseProtocol
{
  constructor(
    private readonly routinesRepository: RoutinesRepositoryProtocol
  ) {}

  async handle(
    data: GetByUserIdRoutinesUseCaseProtocol.Params
  ): Promise<{ routines: RoutineModel[]; total: number }> {
    try {
      const validatedData = await getByUserIdRoutinesValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      const { routines, total } = await this.routinesRepository.findByUserId(
        validatedData as GetByUserIdRoutinesUseCaseProtocol.Params
      );

      return {
        routines,
        total,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de rotinas: ${errorMessage}`);
    }
  }
}
