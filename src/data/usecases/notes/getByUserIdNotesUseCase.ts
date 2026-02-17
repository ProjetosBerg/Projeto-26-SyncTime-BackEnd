import { ServerError } from "@/data/errors/ServerError";
import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { GetByUserIdNotesUseCaseProtocol } from "../interfaces/notes/getByUserIdNotesUseCaseProtocol";
import { getByUserIdNotesValidationSchema } from "../validation/notes/getByUserIdNotesValidationSchema";

/**
 * Busca notas por ID do usuário com paginação e filtros
 *
 * @param {GetByUserIdNotesUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.userId - O ID do usuário proprietário das notas
 * @param {number} [data.page] - Página atual (padrão: 1)
 * @param {number} [data.limit] - Limite de registros por página (padrão: 10)
 * @param {string} [data.search] - Termo de busca na atividade ou descrição
 * @param {string} [data.sortBy] - Campo para ordenação (padrão: "activity")
 * @param {string} [data.order] - Direção da ordenação ("ASC" ou "DESC")
 *
 * @returns {Promise<{ notes: NotesModel[]; total: number }>} Lista de notas e total de registros
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByUserIdNotesUseCase
  implements GetByUserIdNotesUseCaseProtocol
{
  constructor(private readonly notesRepository: NotesRepositoryProtocol) {}

  async handle(
    data: GetByUserIdNotesUseCaseProtocol.Params
  ): Promise<{ notes: NotesModel[]; total: number }> {
    try {
      const validatedData = await getByUserIdNotesValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      const { notes, total } = await this.notesRepository.findByUserId(
        validatedData as GetByUserIdNotesUseCaseProtocol.Params
      );

      return {
        notes,
        total,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de anotações: ${errorMessage}`);
    }
  }
}
