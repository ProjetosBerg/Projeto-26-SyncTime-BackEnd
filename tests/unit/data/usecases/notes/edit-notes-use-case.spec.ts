import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { EditNotesUseCase } from "@/data/usecases/notes/editNotesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockNotes),
    updateNote: jest.fn().mockResolvedValue(mockNotes),
    ...({} as any),
  });

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockRoutine),
    ...({} as any),
  });

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCategory),
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
  const categoryRepositorySpy = makeCategoryRepository();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new EditNotesUseCase(
    notesRepositorySpy,
    routinesRepositorySpy,
    categoryRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    notesRepositorySpy,
    routinesRepositorySpy,
    categoryRepositorySpy,
  };
};

describe("EditNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should edit note successfully", async () => {
    const {
      sut,
      notesRepositorySpy,
      routinesRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const updatedNote = { ...mockNotes, status: "Concluída" };
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);
    notesRepositorySpy.updateNote.mockResolvedValue(updatedNote);

    const input = {
      status: updatedNote.status,
      collaborators: mockNotes.collaborators,
      priority: mockNotes.priority,
      category_id: mockNotes.category_id,
      activity: mockNotes.activity,
      activityType: mockNotes.activityType,
      description: mockNotes.description,
      startTime: mockNotes.startTime,
      endTime: mockNotes.endTime,
      comments: mockNotes.comments,
      routine_id: mockNotes.routine_id,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(updatedNote);
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
      status: input.status,
      collaborators: input.collaborators,
      priority: input.priority,
      category_id: input.category_id,
      activity: input.activity,
      activityType: input.activityType,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      comments: input.comments,
      routine_id: input.routine_id,
    });
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledTimes(1);
  });

  test("should edit note successfully without changes", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);
    notesRepositorySpy.updateNote.mockResolvedValue(mockNotes);

    const input = {
      status: mockNotes.status,
      collaborators: mockNotes.collaborators,
      priority: mockNotes.priority,
      category_id: mockNotes.category_id,
      activity: mockNotes.activity,
      activityType: mockNotes.activityType,
      description: mockNotes.description,
      startTime: mockNotes.startTime,
      endTime: mockNotes.endTime,
      comments: mockNotes.comments,
      routine_id: mockNotes.routine_id,
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
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
      status: input.status,
      collaborators: input.collaborators,
      priority: input.priority,
      category_id: input.category_id,
      activity: input.activity,
      activityType: input.activityType,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      comments: input.comments,
      routine_id: input.routine_id,
    });
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledTimes(1);
  });

  test("should edit note successfully changing routine_id", async () => {
    const { sut, notesRepositorySpy, routinesRepositorySpy } = makeSut();
    const newRoutineId = "123e4567-e89b-12d3-a456-426614174002";
    const newRoutineMock = { ...mockRoutine, id: newRoutineId };
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(newRoutineMock);
    notesRepositorySpy.updateNote.mockResolvedValue({
      ...mockNotes,
      routine_id: newRoutineId,
    });

    const input = {
      status: mockNotes.status,
      routine_id: newRoutineId,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result.routine_id).toBe(newRoutineId);
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: newRoutineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
      status: input.status,
      routine_id: newRoutineId,
    });
    expect(notesRepositorySpy.updateNote).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if activity is too short", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      activity: "A",
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Atividade deve ter no mínimo 2 caracteres",
      ]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if startTime is invalid format", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      startTime: "25:00",
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Formato de hora inválido (HH:MM)"]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if noteId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      status: mockNotes.status,
      noteId: "",
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da Anotação é obrigatório"]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if noteId is invalid UUID", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      status: mockNotes.status,
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
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const input = {
      status: mockNotes.status,
      noteId: mockNotes.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if note is not found", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      status: mockNotes.status,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Anotação com ID ${input.noteId} não encontrada para este usuário`
      )
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if new routine_id does not exist", async () => {
    const { sut, notesRepositorySpy, routinesRepositorySpy } = makeSut();
    const newRoutineId = "123e4567-e89b-12d3-a456-426614174999";
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      routine_id: newRoutineId,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhuma rotina encontrada com o ID ${newRoutineId} para este usuário`
      )
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: newRoutineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if new category_id does not exist", async () => {
    const { sut, notesRepositorySpy, categoryRepositorySpy } = makeSut();
    const newCategoryId = "123e4567-e89b-12d3-a456-426614174998";
    notesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockNotes);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      category_id: newCategoryId,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhuma categoria encontrada com o ID ${newCategoryId} para este usuário`
      )
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: newCategoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      status: mockNotes.status,
      noteId: mockNotes.id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na edição de Anotação: Database error")
    );
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.noteId,
      userId: input.userId,
    });
    expect(notesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.updateNote).not.toHaveBeenCalled();
  });
});
