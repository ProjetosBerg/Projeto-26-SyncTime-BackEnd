import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { ValidationError } from "yup";
import { CreateSummaryDayNotesUseCase } from "@/data/usecases/notes/createSummaryDayNotesUseCase";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    findByUserIdAndDate: jest.fn(),
    findByUserIdAndSummaryDate: jest.fn(),
    deleteNote: jest.fn(),
    create: jest.fn(),
    ...({} as any),
  });

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    findByUserId: jest.fn(),
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
  const routinesRepositorySpy = makeRoutinesRepository();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new CreateSummaryDayNotesUseCase(
    notesRepositorySpy,
    routinesRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    notesRepositorySpy,
    routinesRepositorySpy,
  };
};

describe("CreateSummaryDayNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw ValidationError if date is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      date: "",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input as any)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input as any)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Data é obrigatória"]),
    });
    expect(notesRepositorySpy.findByUserIdAndDate).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if date is invalid format", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      date: "invalid-date",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input as any)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input as any)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Data deve estar no formato YYYY-MM-DD"]),
    });
    expect(notesRepositorySpy.findByUserIdAndDate).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      date: "2025-11-09",
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notesRepositorySpy.findByUserIdAndDate).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error in fetch notes", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByUserIdAndDate.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      date: "2025-11-09",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input as any)).rejects.toThrow(
      new ServerError("Falha na criação do resumo do dia: Database error")
    );
    expect(notesRepositorySpy.findByUserIdAndDate).toHaveBeenCalledTimes(1);
  });
});
