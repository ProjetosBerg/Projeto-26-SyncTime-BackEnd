import { RegisterUserUseCase } from "@/data/usecases/users/registerUserUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { IUser } from "@/auth/interface/IUserAuth";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

export const makeUserAuthRepositoryRepository = (): jest.Mocked<UserAuth> => {
  const userAuth = new UserAuth() as jest.Mocked<UserAuth>;
  userAuth.hashPassword = jest.fn().mockResolvedValue("hashed_password");
  userAuth.hashSecurityAnswer = jest.fn().mockResolvedValue("hashed_answer");
  userAuth.comparePassword = jest.fn().mockResolvedValue(true);
  userAuth.checkToken = jest.fn().mockResolvedValue(true);
  userAuth.getToken = jest.fn().mockReturnValue("valid_token");
  userAuth.getUserByToken = jest.fn().mockResolvedValue({
    id: mockUser.id,
    name: mockUser.name,
    login: mockUser.login,
    email: mockUser.email,
  });
  userAuth.createUserToken = jest.fn().mockResolvedValue({
    message: "Token created successfully",
    token: "valid_token",
    user: mockUser,
  });
  return userAuth;
};

const makeSut = () => {
  const userAuthRepositoryRepositorySpy = makeUserAuthRepositoryRepository();
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const sut = new RegisterUserUseCase(
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy
  );

  return {
    sut,
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
  };
};

describe("RegisterUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register a user and return user data with token", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();

    const input = {
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      password: mockUser.password,
      confirmpassword: mockUser.password,
      securityQuestions: mockUser.security_questions.map((sq) => ({
        question: sq.question,
        answer: sq.answer,
      })),
      imageUrl: "https://example.com/image.jpg",
      publicId: "public_id_123",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      user: mockUser,
      token: "valid_token",
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(2);
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      email: input.email,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
    expect(userAuthRepositoryRepositorySpy.hashPassword).toHaveBeenCalledWith(
      input.password
    );
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).toHaveBeenCalledTimes(input.securityQuestions.length);
    input.securityQuestions.forEach((question, index) => {
      expect(
        userAuthRepositoryRepositorySpy.hashSecurityAnswer
      ).toHaveBeenNthCalledWith(index + 1, question.answer);
    });
    expect(userRepositoryRepositorySpy.create).toHaveBeenCalledWith({
      name: input.name,
      login: input.login,
      email: input.email,
      password: "hashed_password",
      securityQuestions: input.securityQuestions.map((q) => ({
        question: q.question,
        answer: "hashed_answer",
      })),
      imageUrl: input.imageUrl,
      publicId: input.publicId,
    });
    expect(
      userAuthRepositoryRepositorySpy.createUserToken
    ).toHaveBeenCalledWith({
      id: mockUser.id,
      login: mockUser.login,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  test("should throw BusinessRuleError if email already exists", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = {
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      password: mockUser.password,
      confirmpassword: mockUser.password,
      securityQuestions: mockUser.security_questions,
      imageUrl: "https://example.com/image.jpg",
      publicId: "public_id_123",
    };

    userRepositoryRepositorySpy.findOne.mockResolvedValueOnce(mockUser);

    await expect(sut.handle(input)).rejects.toThrow(
      `Já existe um usuário cadastrado com este endereço de email`
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      email: input.email,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should throw BusinessRuleError if login already exists", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = {
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      password: mockUser.password,
      confirmpassword: mockUser.password,
      securityQuestions: mockUser.security_questions,
      imageUrl: "https://example.com/image.jpg",
      publicId: "public_id_123",
    };

    userRepositoryRepositorySpy.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUser);

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Já existe um usuário cadastrado com este login")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(2);
  });

  test("should throw BusinessRuleError if user creation fails", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();

    const input = {
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      password: mockUser.password,
      confirmpassword: mockUser.password,
      securityQuestions: mockUser.security_questions,
      imageUrl: "https://example.com/image.jpg",
      publicId: "public_id_123",
    };

    userRepositoryRepositorySpy.create.mockResolvedValueOnce(undefined);

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Falha ao criar usuário no banco de dados")
    );
    expect(userAuthRepositoryRepositorySpy.hashPassword).toHaveBeenCalledWith(
      input.password
    );
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).toHaveBeenCalledTimes(input.securityQuestions.length);
    input.securityQuestions.forEach((question, index) => {
      expect(
        userAuthRepositoryRepositorySpy.hashSecurityAnswer
      ).toHaveBeenNthCalledWith(index + 1, question.answer);
    });
    expect(userRepositoryRepositorySpy.create).toHaveBeenCalledWith({
      name: input.name,
      login: input.login,
      email: input.email,
      password: "hashed_password",
      securityQuestions: input.securityQuestions.map((q) => ({
        question: q.question,
        answer: "hashed_answer",
      })),
      imageUrl: input.imageUrl,
      publicId: input.publicId,
    });
  });

  test("should throw BusinessRuleError if token creation fails", async () => {
    const { sut, userAuthRepositoryRepositorySpy } = makeSut();

    const input = {
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      password: mockUser.password,
      confirmpassword: mockUser.password,
      securityQuestions: mockUser.security_questions,
      imageUrl: "https://example.com/image.jpg",
      publicId: "public_id_123",
    };

    userAuthRepositoryRepositorySpy.createUserToken.mockResolvedValueOnce({
      message: "Falha ao gerar token de autenticação para o usuário",
      token: null,
      user: mockUser as IUser,
    });

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        "Falha ao gerar token de autenticação para o usuário"
      )
    );
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).toHaveBeenCalledTimes(input.securityQuestions.length);
    input.securityQuestions.forEach((question, index) => {
      expect(
        userAuthRepositoryRepositorySpy.hashSecurityAnswer
      ).toHaveBeenNthCalledWith(index + 1, question.answer);
    });
    expect(
      userAuthRepositoryRepositorySpy.createUserToken
    ).toHaveBeenCalledWith({
      id: mockUser.id,
      login: mockUser.login,
      name: mockUser.name,
      email: mockUser.email,
    });
  });
});
