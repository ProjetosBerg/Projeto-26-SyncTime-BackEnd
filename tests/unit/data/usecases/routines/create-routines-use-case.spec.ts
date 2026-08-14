import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { CreateRoutinesUseCase } from "@/data/usecases/routines/createRoutinesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockRoutine),
    createMany: jest.fn().mockResolvedValue([mockRoutine]),
    findByTypeAndPeriodAndUserId: jest.fn().mockResolvedValue(null),
    findByPeriodAndUserIdAndDateRange: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const routinesRepositorySpy = makeRoutinesRepository();
  const sut = new CreateRoutinesUseCase(routinesRepositorySpy);

  return {
    sut,
    routinesRepositorySpy,
  };
};

describe("CreateRoutinesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a routine successfully", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.findByPeriodAndUserIdAndDateRange.mockResolvedValue(
      null
    );
    routinesRepositorySpy.create.mockResolvedValue(mockRoutine);

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
      createdAt: mockRoutine.created_at,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockRoutine);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledWith({
      period: input.period!,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(routinesRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should create multiple routines in a single repository operation", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const periods = ["Manhã", "Tarde", "Noite"] as const;
    const createdRoutines = periods.map((period, index) => ({
      ...mockRoutine,
      id: `routine-${index + 1}`,
      period,
    }));
    routinesRepositorySpy.createMany.mockResolvedValue(createdRoutines);

    const input = {
      type: "periodo",
      periods: [...periods],
      userId: mockRoutine.user_id,
      createdAt: mockRoutine.created_at,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(createdRoutines);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(3);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledTimes(3);
    expect(routinesRepositorySpy.createMany).toHaveBeenCalledWith(
      periods.map((period) => ({
        type: input.type,
        period,
        userId: input.userId,
        createdAt: input.createdAt,
      }))
    );
    expect(routinesRepositorySpy.createMany).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should reject repeated periods before creating routines", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: "periodo",
      periods: ["Manhã", "Manhã"] as any,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Não é permitido repetir períodos"]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.createMany).not.toHaveBeenCalled();
  });

  test("should require a period for period routines", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: "periodo",
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Selecione pelo menos um período"]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.createMany).not.toHaveBeenCalled();
  });

  test("should not create any routine when one selected period already exists", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByTypeAndPeriodAndUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockRoutine);

    const input = {
      type: "periodo",
      periods: ["Manhã", "Tarde"] as ("Manhã" | "Tarde")[],
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(BusinessRuleError);
    expect(routinesRepositorySpy.createMany).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should create a routine successfully without period", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const routineWithoutPeriod = { ...mockRoutine, period: undefined };
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.create.mockResolvedValue(routineWithoutPeriod as any);

    const input = {
      type: mockRoutine.type,
      period: undefined,
      userId: mockRoutine.user_id,
      createdAt: mockRoutine.created_at,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(routineWithoutPeriod);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(routinesRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if type is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: "",
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Tipo é obrigatório"]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if type is too short", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: "A",
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Tipo deve ter no mínimo 2 caracteres"]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if period is invalid", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: "Inválido" as any,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Período deve ser Manhã, Tarde ou Noite",
      ]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if routine with same type and period already exists", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(
      mockRoutine
    );

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
      createdAt: mockRoutine.created_at,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe uma rotina com o tipo "${input.type}" e período "${input.period}" para este usuário`
      )
    );
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if routine with same period already exists today", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.findByPeriodAndUserIdAndDateRange.mockResolvedValue(
      mockRoutine
    );

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe uma rotina para o período "${input.period}" neste dia para este usuário`
      )
    );
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledWith({
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro de rotina: Database error")
    );
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.create).not.toHaveBeenCalled();
  });
});
