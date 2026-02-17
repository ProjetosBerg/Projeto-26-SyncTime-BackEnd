import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetByUserIdRoutinesUseCase } from "@/data/usecases/routines/getByUserIdRoutinesUseCase";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";

export const makeRoutinesRepository =
  (): jest.Mocked<RoutinesRepositoryProtocol> => ({
    findByUserId: jest.fn().mockResolvedValue({ routines: [], total: 0 }),
    ...({} as any),
  });

const makeSut = () => {
  const routinesRepositorySpy = makeRoutinesRepository();
  const sut = new GetByUserIdRoutinesUseCase(routinesRepositorySpy);

  return {
    sut,
    routinesRepositorySpy,
  };
};

describe("GetByUserIdRoutinesUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get routines successfully", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const mockRoutines = [{ ...mockRoutine }];
    const mockTotal = 1;
    routinesRepositorySpy.findByUserId.mockResolvedValue({
      routines: mockRoutines,
      total: mockTotal,
    });

    const input = {
      userId: mockRoutine.user_id,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "type",
      order: "ASC",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      routines: mockRoutines,
      total: mockTotal,
    });
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledWith(input);
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should get routines successfully with defaults", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const mockRoutines = [{ ...mockRoutine }];
    const mockTotal = 1;
    routinesRepositorySpy.findByUserId.mockResolvedValue({
      routines: mockRoutines,
      total: mockTotal,
    });

    const input = {
      userId: mockRoutine.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      routines: mockRoutines,
      total: mockTotal,
    });
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "type",
      order: "ASC",
    });
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      userId: "",
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(routinesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if page is invalid", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      userId: mockRoutine.user_id,
      page: 0,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Página deve ser maior que 0"]),
    });
    expect(routinesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if search is too long", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const longSearch = "a".repeat(101);
    const input = {
      userId: mockRoutine.user_id,
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
    expect(routinesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if order is invalid", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    const input = {
      userId: mockRoutine.user_id,
      page: 1,
      limit: 10,
      order: "INVALID",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ordem deve ser ASC ou DESC"]),
    });
    expect(routinesRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, routinesRepositorySpy } = makeSut();
    routinesRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockRoutine.user_id,
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de rotinas: Database error")
    );
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: input.page,
      limit: input.limit,
      search: "",
      sortBy: "type",
      order: "ASC",
    });
    expect(routinesRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
