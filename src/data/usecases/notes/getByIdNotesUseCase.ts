import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { GetByIdNotesUseCaseProtocol } from "../interfaces/notes/getByIdNotesUseCaseProtocol";
import { getByIdNotesValidationSchema } from "../validation/notes/getByIdNotesValidationSchema";

/**
 * Busca uma Anotação por ID e ID do usuário
 *
 * @param {GetByIdNotesUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.noteId - O ID da Anotação
 * @param {string} data.userId - O ID do usuário proprietário da Anotação
 *
 * @returns {Promise<NotesModel>} A Anotação encontrada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se a Anotação não for encontrada para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByIdNotesUseCase implements GetByIdNotesUseCaseProtocol {
  constructor(private readonly notesRepository: NotesRepositoryProtocol) {}

  async handle(data: GetByIdNotesUseCaseProtocol.Params): Promise<NotesModel> {
    try {
      await getByIdNotesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const note = await this.notesRepository.findByIdAndUserId({
        id: data.noteId,
        userId: data.userId,
      });

      if (!note) {
        throw new NotFoundError(
          `AAnotaçãoção com ID ${data.noteId} não encontrada para este usuário`
        );
      }

      return note;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de aAnotaçãoção: ${errorMessage}`);
    }
  }
}
