import { DeleteUserByIdUseCase } from "@/data/usecases/users/deleteUserByIdUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { ServerError } from "@/data/errors/ServerError";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(null),
    deleteUser: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const sut = new DeleteUserByIdUseCase(userRepositoryRepositorySpy);

  return {
    sut,
    userRepositoryRepositorySpy,
  };
};

describe("DeleteUserByIdUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete user successfully with valid id", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue(mockUser);

    const input = { id: mockUser.id };
    const result = await sut.handle(input);

    expect(result).toEqual({ message: "Usuário deletado com sucesso" });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.deleteUser).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(userRepositoryRepositorySpy.deleteUser).toHaveBeenCalledTimes(1);
  });

  test("should throw NotFoundError if user not found", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue(null);

    const input = { id: "invalid_id" };
    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("Usuário não encontrado")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(userRepositoryRepositorySpy.deleteUser).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is empty", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = { id: "" };
    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(userRepositoryRepositorySpy.deleteUser).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is missing", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = {} as any;
    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(userRepositoryRepositorySpy.deleteUser).not.toHaveBeenCalled();
  });

  test("should throw ServerError if deleteUser fails", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue(mockUser);
    userRepositoryRepositorySpy.deleteUser.mockRejectedValue(
      new Error("Database error")
    );

    const input = { id: mockUser.id };
    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao Deletar o Usuário pelo Id: Database error")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.deleteUser).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(userRepositoryRepositorySpy.deleteUser).toHaveBeenCalledTimes(1);
  });
});
