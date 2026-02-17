import { FindUserByIdUseCase } from "@/data/usecases/users/findUserByIdUseCase";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { makeUserAuthRepositoryRepository } from "./edit-user-by-id-use-case.spec";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const userAuthRepositoryRepositorySpy = makeUserAuthRepositoryRepository();
  const sut = new FindUserByIdUseCase(userRepositoryRepositorySpy);

  return {
    sut,
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
  };
};

describe("FindUserByIdUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return user with only security questions for valid id", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
    } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue({
      ...mockUser,
      security_questions: [
        {
          id: "question_id",
          question: "What is your pet's name?",
          answer: "hashed_answer",
        },
        {
          id: "question_id",
          question: "What is your favorite color?",
          answer: "hashed_answer",
        },
      ],
    });

    const result = await sut.handle({ id: mockUser.id });

    expect(result).toEqual({
      user: {
        id: mockUser.id,
        name: mockUser.name,
        login: mockUser.login,
        email: mockUser.email,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
        security_questions: [
          { question: "What is your pet's name?" },
          { question: "What is your favorite color?" },
        ],
      },
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: mockUser.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(
      userAuthRepositoryRepositorySpy.comparePassword
    ).not.toHaveBeenCalled();
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
  });

  test("should throw BusinessRuleError if no security questions", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();
    userRepositoryRepositorySpy.findOne.mockResolvedValue({
      ...mockUser,
      security_questions: [],
    });

    await expect(sut.handle({ id: mockUser.id })).rejects.toThrow(
      new BusinessRuleError(
        "Nenhuma questão de segurança registrada para este usuário"
      )
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      id: mockUser.id,
    });
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = { id: "" };
    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is missing", async () => {
    const { sut, userRepositoryRepositorySpy } = makeSut();

    const input = {} as any;
    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositoryRepositorySpy.findOne).not.toHaveBeenCalled();
  });
});
