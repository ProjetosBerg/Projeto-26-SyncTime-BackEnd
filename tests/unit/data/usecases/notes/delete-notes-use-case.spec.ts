import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { ValidationError } from "yup";
import { DeleteNotesUseCase } from "@/data/usecases/notes/deleteNotesUseCase";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    deleteNote: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockNotes),
    ...({} as any),
  });

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const notesRepositorySpy = makeNotesRepository();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new DeleteNotesUseCase(
    notesRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    notesRepositorySpy,
  };
};

describe("DeleteNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete note successfully", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.deleteNote.mockResolvedValue();

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await sut.handle(input);

    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if noteId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      noteId: "",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da anotação é obrigatório"]),
    });
    expect(notesRepositorySpy.deleteNote).not.toHaveBeenCalled();
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
        "ID da anotação deve ser um UUID válido",
      ]),
    });
    expect(notesRepositorySpy.deleteNote).not.toHaveBeenCalled();
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
    expect(notesRepositorySpy.deleteNote).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if note is not found", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.deleteNote.mockRejectedValue(
      new NotFoundError(
        `Anotação com ID ${mockNotes.id} não encontrada para este usuário`
      )
    );

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Anotação com ID ${input.noteId} não encontrada para este usuário`
      )
    );
    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.deleteNote.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na deleção de anotação: Database error")
    );
    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.deleteNote).toHaveBeenCalledTimes(1);
  });
});
