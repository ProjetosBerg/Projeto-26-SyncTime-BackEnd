import { ServerError } from "@/data/errors/ServerError";
import { GetMyDayUseCase } from "@/data/usecases/myDay/getMyDayUseCase";
import { MyDayItemModel } from "@/domain/models/postgres/MyDayModel";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { ValidationError } from "yup";

const makeNotesRepository = (): jest.Mocked<NotesRepositoryProtocol> => ({
  findForMyDay: jest.fn().mockResolvedValue([]),
  ...({} as any),
});

const makeItem = (
  id: string,
  status: string,
  startTime: string
): MyDayItemModel => ({
  id,
  activity: `Atividade ${id}`,
  status,
  priority: "Alta",
  startTime,
  endTime: "10:00",
  dateOfNote: new Date("2026-10-17T12:00:00.000Z"),
  routine: {
    id: "routine-123",
    type: "Trabalho",
    period: "Manhã",
  },
  category: {
    id: "category-123",
    name: "Projetos",
  },
});

const makeSut = () => {
  const notesRepositorySpy = makeNotesRepository();
  const sut = new GetMyDayUseCase(notesRepositorySpy);

  return { sut, notesRepositorySpy };
};

describe("GetMyDayUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return the day items and progress summary", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    const items = [
      makeItem("1", "Concluída", "08:00"),
      makeItem("2", "Em andamento", "10:00"),
      makeItem("3", "Pendente", "14:00"),
    ];
    notesRepositorySpy.findForMyDay.mockResolvedValue(items);

    const result = await sut.handle({
      userId: "user-123",
      date: "2026-10-17",
    });

    expect(result).toEqual({
      date: "2026-10-17",
      items,
      summary: {
        total: 3,
        completed: 1,
        inProgress: 1,
        pending: 1,
        completionPercentage: 33,
      },
    });
    expect(notesRepositorySpy.findForMyDay).toHaveBeenCalledWith({
      userId: "user-123",
      date: "2026-10-17",
    });
  });

  test("should return an empty day", async () => {
    const { sut } = makeSut();

    const result = await sut.handle({
      userId: "user-123",
      date: "2026-10-17",
    });

    expect(result.items).toEqual([]);
    expect(result.summary).toEqual({
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      completionPercentage: 0,
    });
  });

  test("should reject an invalid calendar date", async () => {
    const { sut, notesRepositorySpy } = makeSut();

    await expect(
      sut.handle({ userId: "user-123", date: "2026-02-30" })
    ).rejects.toThrow(ValidationError);
    expect(notesRepositorySpy.findForMyDay).not.toHaveBeenCalled();
  });

  test("should reject a date outside the ISO format", async () => {
    const { sut, notesRepositorySpy } = makeSut();

    await expect(
      sut.handle({ userId: "user-123", date: "17/10/2026" })
    ).rejects.toThrow(ValidationError);
    expect(notesRepositorySpy.findForMyDay).not.toHaveBeenCalled();
  });

  test("should wrap unexpected repository errors", async () => {
    const { sut, notesRepositorySpy } = makeSut();
    notesRepositorySpy.findForMyDay.mockRejectedValue(
      new Error("Database error")
    );

    await expect(
      sut.handle({ userId: "user-123", date: "2026-10-17" })
    ).rejects.toThrow(
      new ServerError("Falha ao carregar Meu Dia: Database error")
    );
  });
});
