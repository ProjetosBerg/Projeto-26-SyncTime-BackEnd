import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { ValidationError } from "yup";
import { GetByUserIdNotesUseCase } from "@/data/usecases/notes/getByUserIdNotesUseCase";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    findByUserId: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
    ...({} as any),
  });

const makeSut = () => {
  const notesRepositorySpy = makeNotesRepository();
  const sut = new GetByUserIdNotesUseCase(notesRepositorySpy);

  return {
    sut,
    notesRepositorySpy,
  };
};

describe("GetByUserIdNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get notes successfully", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const mockNotesList = [{ ...mockNotes }];
    const mockTotal = 1;
    notesRepositorySpy.findByUserId.mockResolvedValue({
      notes: mockNotesList,
      total: mockTotal,
    });

    const input = {
      userId: mockNotes.user_id,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "activity",
      order: "ASC",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      notes: mockNotesList,
      total: mockTotal,
    });
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledWith(input);
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should get notes successfully with defaults", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const mockNotesList = [{ ...mockNotes }];
    const mockTotal = 1;
    notesRepositorySpy.findByUserId.mockResolvedValue({
      notes: mockNotesList,
      total: mockTotal,
    });

    const input = {
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      notes: mockNotesList,
      total: mockTotal,
    });
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "activity",
      order: "ASC",
    });
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      userId: "",
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if page is invalid", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      userId: mockNotes.user_id,
      page: 0,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Página deve ser maior que 0"]),
    });
    expect(notesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if limit is invalid", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      userId: mockNotes.user_id,
      page: 1,
      limit: 101,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Limite máximo de 100 registros"]),
    });
    expect(notesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if search is too long", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const longSearch = "a".repeat(101);
    const input = {
      userId: mockNotes.user_id,
      page: 1,
      limit: 10,
      search: longSearch,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Busca deve ter no máximo 100 caracteres",
      ]),
    });
    expect(notesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if order is invalid", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      userId: mockNotes.user_id,
      page: 1,
      limit: 10,
      order: "INVALID",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ordem deve ser ASC ou DESC"]),
    });
    expect(notesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotes.user_id,
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de anotações: Database error")
    );
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: input.page,
      limit: input.limit,
      search: "",
      sortBy: "activity",
      order: "ASC",
    });
    expect(notesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
