import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { CreateNotesUseCase } from "@/data/usecases/notes/createNotesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeNotesRepository =
  (): jest.Mocked<NotesRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockNotes),
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

  const sut = new CreateNotesUseCase(
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

describe("CreateNotesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a note successfully", async () => {
    const {
      sut,
      notesRepositorySpy,
      routinesRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    notesRepositorySpy.create.mockResolvedValue(mockNotes);

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
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockNotes);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routine_id,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.category_id,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(notesRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should create a note successfully without category", async () => {
    const { sut, notesRepositorySpy, routinesRepositorySpy } = makeSut();
    const noteWithoutCategory = { ...mockNotes, category_id: undefined };
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    notesRepositorySpy.create.mockResolvedValue(noteWithoutCategory as any);

    const input = {
      status: mockNotes.status,
      collaborators: undefined,
      priority: mockNotes.priority,
      category_id: undefined,
      activity: mockNotes.activity,
      activityType: mockNotes.activityType,
      description: mockNotes.description,
      startTime: mockNotes.startTime,
      endTime: mockNotes.endTime,
      comments: undefined,
      routine_id: mockNotes.routine_id,
      userId: mockNotes.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(noteWithoutCategory);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routine_id,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(notesRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if status is empty", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
    const input = {
      status: "",
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
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Status é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if priority is missing", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
    const input = {
      status: mockNotes.status,
      collaborators: mockNotes.collaborators,
      priority: undefined as any,
      category_id: mockNotes.category_id,
      activity: mockNotes.activity,
      activityType: mockNotes.activityType,
      description: mockNotes.description,
      startTime: mockNotes.startTime,
      endTime: mockNotes.endTime,
      comments: mockNotes.comments,
      routine_id: mockNotes.routine_id,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Prioridade é obrigatória"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if startTime is invalid format", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
    const input = {
      ...mockNotes,
      startTime: "25:00",
      userId: mockNotes.user_id,
    } as any;

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Formato de hora inválido (HH:MM)"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if routine_id is missing", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
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
      routine_id: undefined as any,
      userId: mockNotes.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da rotina é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
    const input = {
      ...mockNotes,
      userId: "",
    } as any;

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if routine does not exist", async () => {
    const { sut, routinesRepositorySpy, notesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      ...mockNotes,
      userId: mockNotes.user_id,
    } as any;

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhuma rotina encontrada com o ID ${input.routine_id} para este usuário`
      )
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routine_id,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if category does not exist", async () => {
    const {
      sut,
      routinesRepositorySpy,
      categoryRepositorySpy,
      notesRepositorySpy,
    } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      ...mockNotes,
      userId: mockNotes.user_id,
    } as any;

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhuma categoria encontrada com o ID ${input.category_id} para este usuário`
      )
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routine_id,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.category_id,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy, notesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      ...mockNotes,
      userId: mockNotes.user_id,
    } as any;

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro de Anotação: Database error")
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routine_id,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(notesRepositorySpy.create).not.toHaveBeenCalled();
  });
});
