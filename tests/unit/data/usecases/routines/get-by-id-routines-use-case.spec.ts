import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetByIdRoutinesUseCase } from "@/data/usecases/routines/getByIdRoutinesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const routinesRepositorySpy = makeRoutinesRepository();
  const sut = new GetByIdRoutinesUseCase(routinesRepositorySpy);

  return {
    sut,
    routinesRepositorySpy,
  };
};

describe("GetByIdRoutinesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get routine successfully", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(mockRoutine);

    const input = {
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
  });

  test("should throw ValidationError if routineId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      routineId: "",
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da rotina é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if routineId is invalid UUID", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      routineId: "invalid-uuid",
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da rotina deve ser um UUID válido"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      routineId: mockRoutine.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if routine is not found", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
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
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de rotina: Database error")
    );
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
  });
});
