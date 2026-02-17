import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { DeleteRoutinesUseCaseProtocol } from "../interfaces/routines/deleteRoutinesUseCaseProtocol";
import { deleteRoutinesValidationSchema } from "../validation/routines/deleteRoutinesValidationSchema";

/**
 * Deleta uma rotina existente para um usuário
 *
 * @param {DeleteRoutinesUseCaseProtocol.Params} data - Os dados de entrada para a deleção da rotina
 * @param {string} data.routineId - O ID da rotina a ser deletada
 * @param {string} data.userId - O ID do usuário proprietário da rotina
 *
 * @returns {Promise<void>} Não retorna valor
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se a rotina não for encontrada para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a deleção
 */

export class DeleteRoutinesUseCase implements DeleteRoutinesUseCaseProtocol {
  constructor(
    private readonly routinesRepository: RoutinesRepositoryProtocol
  ) {}

  async handle(data: DeleteRoutinesUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteRoutinesValidationSchema.validate(data, {
        abortEarly: false,
      });

      await this.routinesRepository.deleteRoutine({
        id: data.routineId,
        userId: data.userId,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(`Falha na deleção de rotina: ${errorMessage}`);
    }
  }
}
