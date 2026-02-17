import { EditUserByIdUseCase } from "@/data/usecases/users/editUserByIdUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { faker } from "@faker-js/faker";
import UserAuth from "@/auth/users/userAuth";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(null),
    updateUser: jest.fn().mockResolvedValue(mockUser),
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

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const userAuthRepositoryRepositorySpy = makeUserAuthRepositoryRepository();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new EditUserByIdUseCase(
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
  };
};

describe("EditUserByIdUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update user successfully with all fields", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(null);

    const input = {
      id: mockUser.id,
      name: "New Name",
      email: "new.email@example.com",
      securityQuestions: [
        {
          id: faker.string.uuid(),
          question: "Nova pergunta de segurança?",
          answer: "Yes",
        },
        {
          id: faker.string.uuid(),
          question: "Nova pergunta de segurança 2?",
          answer: "Yes 2",
        },
      ],
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockUser);
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      email: input.email,
    });
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).toHaveBeenCalledTimes(input.securityQuestions.length);
    input.securityQuestions.forEach((question, index) => {
      expect(
        userAuthRepositoryRepositorySpy.hashSecurityAnswer
      ).toHaveBeenNthCalledWith(index + 1, question.answer);
    });
    expect(userRepositoryRepositorySpy.updateUser).toHaveBeenCalledWith({
      id: input.id,
      name: input.name,
      email: input.email,
      securityQuestions: input.securityQuestions.map((sq) => ({
        question: sq.question,
        answer: "hashed_answer",
      })),
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(2);
  });

  test("should update user successfully with partial fields", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValueOnce(mockUser);

    const input = {
      id: mockUser.id,
      name: "New Name",
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockUser);
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).not.toHaveBeenCalled();
    expect(userRepositoryRepositorySpy.updateUser).toHaveBeenCalledWith({
      id: input.id,
      name: input.name,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should throw NotFoundError if user not found", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValueOnce(null);

    const input = {
      id: "invalid_id",
      name: "New Name",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("Usuário não encontrado")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).not.toHaveBeenCalled();
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should throw BusinessRuleError if email is already in use", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ ...mockUser, id: "different_id" });

    const input = {
      id: mockUser.id,
      email: "existing.email@example.com",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("O email fornecido já está em uso")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      email: input.email,
    });
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).not.toHaveBeenCalled();
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(2);
  });

  test("should throw BusinessRuleError if update fails", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValueOnce(mockUser);
    userRepositoryRepositorySpy.updateUser.mockResolvedValue(undefined);

    const input = {
      id: mockUser.id,
      name: "New Name",
      securityQuestions: [
        {
          id: faker.string.uuid(),
          question: "Nova pergunta de segurança?",
          answer: "Yes",
        },
      ],
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError("Falha ao atualizar os dados do usuário")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.id,
    });
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).toHaveBeenCalledTimes(input.securityQuestions.length);
    input.securityQuestions.forEach((question, index) => {
      expect(
        userAuthRepositoryRepositorySpy.hashSecurityAnswer
      ).toHaveBeenNthCalledWith(index + 1, question.answer);
    });
    expect(userRepositoryRepositorySpy.updateUser).toHaveBeenCalledWith({
      id: input.id,
      name: input.name,
      securityQuestions: input.securityQuestions.map((sq) => ({
        question: sq.question,
        answer: "hashed_answer",
      })),
    });
  });

  test("should throw ValidationError if input is invalid", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();

    const input = {
      id: "",
      name: "",
      email: "invalid-email",
      securityQuestions: [],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(
      userAuthRepositoryRepositorySpy.hashSecurityAnswer
    ).not.toHaveBeenCalled();
  });
});
