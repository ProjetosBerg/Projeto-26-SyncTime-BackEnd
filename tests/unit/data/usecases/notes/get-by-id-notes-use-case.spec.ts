import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { ValidationError } from "yup";
import { GetByIdNotesUseCase } from "@/data/usecases/notes/getByIdNotesUseCase";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const notesRepositorySpy = makeNotesRepository();
  const sut = new GetByIdNotesUseCase(notesRepositorySpy);

  return {
    sut,
    notesRepositorySpy,
  };
};

describe("GetByIdNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get note successfully", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockNotes);
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if noteId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      noteId: "",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da Anotação é obrigatório"]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if noteId is invalid UUID", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      noteId: "invalid-uuid",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "ID da Anotação deve ser um UUID válido",
      ]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      noteId: mockNotes.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if note is not found", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `AAnotaçãoção com ID ${input.noteId} não encontrada para este usuário`
      )
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de aAnotaçãoção: Database error")
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
  });
});
