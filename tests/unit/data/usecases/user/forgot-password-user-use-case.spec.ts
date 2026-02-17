import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { forgotPasswordUserValidationSchema } from "@/data/usecases/validation/users/forgotPasswordUserValidationSchema";

jest.mock(
  "@/data/usecases/validation/users/forgotPasswordUserValidationSchema"
);

export const makeUserRepositorySpy =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(mockUser),
    updatePassword: jest.fn().mockResolvedValue(mockUser),
    ...({} as any),
  });

export const makeUserAuthSpy = (): jest.Mocked<UserAuth> => {
  const userAuth = new UserAuth() as jest.Mocked<UserAuth>;
  userAuth.hashPassword = jest.fn().mockResolvedValue("hashed_password");
  userAuth.compareSecurityAnswer = jest.fn().mockResolvedValue(true);
  return userAuth;
};

const makeSut = () => {
  const userRepositorySpy = makeUserRepositorySpy();
  const userAuthSpy = makeUserAuthSpy();
  const sut = new ForgotPasswordUserUseCase(userRepositorySpy, userAuthSpy);

  return {
    sut,
    userRepositorySpy,
    userAuthSpy,
  };
};

describe("ForgotPasswordUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      forgotPasswordUserValidationSchema.validate as jest.Mock
    ).mockResolvedValue(undefined);
  });

  test("should successfully reset password when all conditions are met", async () => {
    const { sut, userRepositorySpy, userAuthSpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: mockUser.security_questions.map((sq) => ({
        question: sq.question,
        answer: sq.answer,
      })),
    };

    const result = await sut.handle(input);

    expect(result).toEqual({ message: "Senha redefinida com sucesso" });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
    expect(userAuthSpy.compareSecurityAnswer).toHaveBeenCalledTimes(
      input.securityQuestions.length
    );
    input.securityQuestions.forEach((question, index) => {
      expect(userAuthSpy.compareSecurityAnswer).toHaveBeenNthCalledWith(
        index + 1,
        question.answer,
        mockUser.security_questions[index].answer
      );
    });
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
      securityQuestions: mockUser.security_questions,
    };

    const validationError = new Error("Validation failed");
    validationError.name = "ValidationError";
    (
      forgotPasswordUserValidationSchema.validate as jest.Mock
    ).mockRejectedValue(validationError);

    await expect(sut.handle(input)).rejects.toThrow(validationError);
    expect(forgotPasswordUserValidationSchema.validate).toHaveBeenCalledWith(
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
      securityQuestions: mockUser.security_questions,
    };

    userRepositorySpy.findOne.mockResolvedValueOnce(null);

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("Usuário não encontrado")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
  });

  test("should throw BusinessRuleError if no security questions are registered", async () => {
    const { sut, userRepositorySpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: mockUser.security_questions,
    };

    userRepositorySpy.findOne.mockResolvedValueOnce({
      ...mockUser,
      security_questions: [],
    });

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        "Nenhuma questão de segurança registrada para este usuário"
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
  });

  test("should throw BusinessRuleError if number of security questions does not match", async () => {
    const { sut } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: [mockUser.security_questions[0]],
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        "Número de questões de segurança fornecidas não corresponde ao registrado"
      )
    );
  });

  test("should throw BusinessRuleError if a security question is not found", async () => {
    const { sut } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: [
        { question: "Non-existent question", answer: "answer" },
        ...mockUser.security_questions.slice(1),
      ],
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Questão de segurança não encontrada")
    );
  });

  test("should throw BusinessRuleError if a security answer is invalid", async () => {
    const { sut, userAuthSpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: mockUser.security_questions,
    };

    userAuthSpy.compareSecurityAnswer.mockResolvedValueOnce(false);

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Resposta de segurança inválida")
    );
    expect(userAuthSpy.compareSecurityAnswer).toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if password update fails", async () => {
    const { sut, userRepositorySpy } = makeSut();

    const input = {
      login: mockUser.login,
      newPassword: "new_password",
      confirmNewPassword: "new_password",
      securityQuestions: mockUser.security_questions,
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
      securityQuestions: mockUser.security_questions,
    };

    const unexpectedError = new Error("Unexpected error");
    userRepositorySpy.findOne.mockRejectedValueOnce(unexpectedError);

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na redefinição de senha: Unexpected error")
    );
  });
});
