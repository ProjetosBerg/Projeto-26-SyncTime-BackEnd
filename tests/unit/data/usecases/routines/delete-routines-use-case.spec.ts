import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { DeleteRoutinesUseCase } from "@/data/usecases/routines/deleteRoutinesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    deleteRoutine: jest.fn(),
    ...({} as any),
  });

const makeSut = () => {
  const routinesRepositorySpy = makeRoutinesRepository();
  const sut = new DeleteRoutinesUseCase(routinesRepositorySpy);

  return {
    sut,
    routinesRepositorySpy,
  };
};

describe("DeleteRoutinesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete routine successfully", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.deleteRoutine.mockResolvedValue();

    const input = {
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await sut.handle(input);

    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledTimes(1);
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
    expect(routinesRepositorySpy.deleteRoutine).not.toHaveBeenCalled();
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
    expect(routinesRepositorySpy.deleteRoutine).not.toHaveBeenCalled();
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
    expect(routinesRepositorySpy.deleteRoutine).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if routine is not found", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.deleteRoutine.mockRejectedValue(
      new NotFoundError(
        `Rotina com ID ${mockRoutine.id} não encontrada para este usuário`
      )
    );

    const input = {
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Rotina com ID ${input.routineId} não encontrada para este usuário`
      )
    );
    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.deleteRoutine.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      routineId: mockRoutine.id,
      userId: mockRoutine.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na deleção de rotina: Database error")
    );
    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledWith({
      id: input.routineId,
      userId: input.userId,
    });
    expect(routinesRepositorySpy.deleteRoutine).toHaveBeenCalledTimes(1);
  });
});
