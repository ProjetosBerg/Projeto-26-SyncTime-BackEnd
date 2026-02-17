import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { EditRoutinesUseCase } from "@/data/usecases/routines/editRoutinesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockRoutine),
    findByTypeAndPeriodAndUserId: jest.fn().mockResolvedValue(null),
    findByPeriodAndUserIdAndDateRange: jest.fn().mockResolvedValue(null),
    updateRoutine: jest.fn().mockResolvedValue(mockRoutine),
    ...({} as any),
  });

const makeSut = () => {
  const routinesRepositorySpy = makeRoutinesRepository();
  const sut = new EditRoutinesUseCase(routinesRepositorySpy);

  return {
    sut,
    routinesRepositorySpy,
  };
};

describe("EditRoutinesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should edit routine successfully", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const updatedRoutine = { ...mockRoutine, type: "Exercício noturno" };
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.findByPeriodAndUserIdAndDateRange.mockResolvedValue(
      null
    );
    routinesRepositorySpy.updateRoutine.mockResolvedValue(updatedRoutine);

    const input = {
      type: updatedRoutine.type,
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(updatedRoutine);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      excludeId: input.routineId,
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
      excludeId: input.routineId,
    });
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      type: input.type,
      period: input.period,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledTimes(1);
  });

  test("should edit routine successfully without changes (no business checks)", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    routinesRepositorySpy.updateRoutine.mockResolvedValue(mockRoutine);

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockRoutine);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      type: input.type,
      period: input.period,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledTimes(1);
  });

  test("should edit routine successfully without period", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const routineWithoutPeriod = { ...mockRoutine, period: undefined };
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(
      routineWithoutPeriod
    );
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.updateRoutine.mockResolvedValue(routineWithoutPeriod);

    const input = {
      type: "Nova rotina",
      period: undefined,
      routineId: routineWithoutPeriod.id,
      userId: routineWithoutPeriod.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(routineWithoutPeriod);
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      excludeId: input.routineId,
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      type: input.type,
      period: input.period,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.updateRoutine).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if type is too short", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: "A",
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Tipo deve ter no mínimo 2 caracteres"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if period is invalid", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: "Inválido" as any,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Período deve ser Manhã, Tarde ou Noite",
      ]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if routineId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: "",
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da rotina é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if routineId is invalid UUID", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: "invalid-uuid",
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da rotina deve ser um UUID válido"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if routine is not found", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Rotina com ID ${input.routineId} não encontrada para este usuário`
      )
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if new type and period already exist (excluding self)", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(
      mockRoutine
    );

    const input = {
      type: "Novo tipo",
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe uma rotina com o tipo "${input.type}" e período "${input.period}" para este usuário`
      )
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      excludeId: input.routineId,
    });
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if new period already exists today (excluding self)", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const mockExistingToday = {
      ...mockRoutine,
      id: "987fcdeb-51a2-43d5-b789-0123456789ab",
    };
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);
    routinesRepositorySpy.findByTypeAndPeriodAndUserId.mockResolvedValue(null);
    routinesRepositorySpy.findByPeriodAndUserIdAndDateRange.mockResolvedValue(
      mockExistingToday
    );

    const input = {
      type: mockRoutine.type,
      period: "Noite" as any,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe uma rotina para o período "${input.period}" neste dia para este usuário`
      )
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).toHaveBeenCalledWith({
      type: input.type,
      period: input.period,
      userId: input.userId,
      excludeId: input.routineId,
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
      excludeId: input.routineId,
    });
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).toHaveBeenCalledTimes(1);
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      type: mockRoutine.type,
      period: mockRoutine.period,
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na edição de rotina: Database error")
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      routinesRepositorySpy.findByTypeAndPeriodAndUserId
    ).not.toHaveBeenCalled();
    expect(
      routinesRepositorySpy.findByPeriodAndUserIdAndDateRange
    ).not.toHaveBeenCalled();
    expect(routinesRepositorySpy.updateRoutine).not.toHaveBeenCalled();
  });
});
