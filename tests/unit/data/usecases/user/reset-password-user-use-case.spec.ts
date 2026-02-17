import { ResetPasswordUserUseCase } from "@/data/usecases/users/resetPasswordUserUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { resetPasswordUserValidationSchema } from "@/data/usecases/validation/users/resetPasswordUserValidationSchema";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

jest.mock("@/data/usecases/validation/users/resetPasswordUserValidationSchema");

export const makeUserRepositorySpy =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(mockUser),
    updatePassword: jest.fn().mockResolvedValue(mockUser),
    ...({} as any),
  });

export const makeUserAuthSpy = (): jest.Mocked<UserAuth> => {
  const userAuth = new UserAuth() as jest.Mocked<UserAuth>;
  userAuth.hashPassword = jest.fn().mockResolvedValue("hashed_password");
  userAuth.comparePassword = jest.fn().mockResolvedValue(true);
  return userAuth;
};

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositorySpy = makeUserRepositorySpy();
  const userAuthSpy = makeUserAuthSpy();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new ResetPasswordUserUseCase(
    userRepositorySpy,
    userAuthSpy,
    notificationRepositorySpy
  );

  return {
    sut,
    userRepositorySpy,
    userAuthSpy,
  };
};

describe("ResetPasswordUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resetPasswordUserValidationSchema.validate as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  test("should successfully reset password when all conditions are met", async () => {
    const { sut, userRepositorySpy, userAuthSpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: mockUser.password,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({ message: "Senha redefinida com sucesso" });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
    expect(userAuthSpy.comparePassword).toHaveBeenCalledWith(
      input.oldPassword,
      mockUser.password
    );
    expect(userAuthSpy.hashPassword).toHaveBeenCalledWith(input.newPassword);
    expect(userRepositorySpy.updatePassword).toHaveBeenCalledWith({
      id: mockUser.id,
      password: "hashed_password",
    });
  });

  test("should throw ValidationError if validation fails", async () => {
    const { sut } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: "old_password",
    };

    const validationError = new Error("Validation failed");
    validationError.name = "ValidationError";
    (resetPasswordUserValidationSchema.validate as jest.Mock).mockRejectedValue(
      validationError
    );

    await expect(sut.handle(input)).rejects.toThrow(validationError);
    expect(resetPasswordUserValidationSchema.validate).toHaveBeenCalledWith(
      input,
      {
        abortEarly: false,
      }
    );
  });

  test("should throw NotFoundError if user is not found", async () => {
    const { sut, userRepositorySpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: "old_password",
    };

    userRepositorySpy.findOne.mockResolvedValueOnce(null);

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("Usuário não encontrado")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
  });

  test("should throw BusinessRuleError if old password is incorrect", async () => {
    const { sut, userAuthSpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: "wrong_password",
    };

    userAuthSpy.comparePassword.mockResolvedValueOnce(false);

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Senha antiga incorreta")
    );
    expect(userAuthSpy.comparePassword).toHaveBeenCalledWith(
      input.oldPassword,
      mockUser.password
    );
  });

  test("should throw BusinessRuleError if password update fails", async () => {
    const { sut, userRepositorySpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: mockUser.password,
    };

    userRepositorySpy.updatePassword.mockResolvedValueOnce(undefined);

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Falha ao atualizar a senha do usuário")
    );
    expect(userRepositorySpy.updatePassword).toHaveBeenCalledWith({
      id: mockUser.id,
      password: "hashed_password",
    });
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, userRepositorySpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      oldPassword: mockUser.password,
    };

    const unexpectedError = new Error("Unexpected error");
    userRepositorySpy.findOne.mockRejectedValueOnce(unexpectedError);

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na redefinição de senha: Unexpected error")
    );
  });
});
