import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { FindQuestionsUserUseCase } from "@/data/usecases/users/findQuestionsUserUseCase";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { ValidationError } from "yup";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const sut = new FindQuestionsUserUseCase(userRepositoryRepositorySpy);

  return {
    sut,
    userRepositoryRepositorySpy,
  };
};

describe("FindQuestionsUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return security questions for valid login", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue(mockUser);
    const result = await sut.handle({ login: mockUser.login });

    expect(result).toEqual({
      securityQuestions: mockUser.security_questions.map((q) => ({
        question: q.question,
      })),
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: mockUser.login,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should return decoy questions if user is not found", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue(null);

    const input = { login: "invalid_login" };
    const result = await sut.handle(input);
    expect(result.securityQuestions).toHaveLength(3);
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: input.login,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should return decoy questions if no questions are registered", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue({
      ...mockUser,
      security_questions: [],
    });

    const result = await sut.handle({ login: mockUser.login });
    expect(result.securityQuestions).toHaveLength(3);
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: mockUser.login,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if login is empty", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = { login: "" };
    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
  });
});
