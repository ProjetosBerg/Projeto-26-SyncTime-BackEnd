import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { LogoutUserUseCase } from "@/data/usecases/users/logoutUserUseCase";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { Authentication } from "@/domain/entities/postgres/Authentication";

export const makeAuthenticationRepositoryRepository =
  (): jest.Mocked<AuthenticationRepositoryProtocol> => {
    return {
      updateLogout: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
      hasLoginToday: jest.fn().mockResolvedValue(false),
      ...({} as any),
    };
  };

const mockAuthentication: any = {
  id: "1",
  userId: "user-id",
  user: {
    id: "user-id",
    name: "Mock User",
    login: "mockuser",
    email: "mock@example.com",
    password: "hashed_password",
    created_at: new Date(),
    updated_at: new Date(),
    authentications: [],
    security_questions: [],
    categories: [],
    routines: [],
    monthly_records: [],
    transactions: [],
    notes: [],
    bio: undefined,
  },
  loginAt: new Date(),
  logoutAt: new Date(),
  sessionId: "mock-session-id",
  isOffensive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeSut = () => {
  const authenticationRepositoryRepositorySpy =
    makeAuthenticationRepositoryRepository();
  const sut = new LogoutUserUseCase(authenticationRepositoryRepositorySpy);

  const logoutData = {
    sessionId: "mock-session-id",
  };

  return {
    sut,
    authenticationRepositoryRepositorySpy,
    logoutData,
  };
};

describe("LogoutUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully logout a session", async () => {
    const { sut, authenticationRepositoryRepositorySpy, logoutData } =
      makeSut();

    authenticationRepositoryRepositorySpy.updateLogout.mockResolvedValue(
      mockAuthentication
    );

    const result = await sut.handle(logoutData);

    expect(
      authenticationRepositoryRepositorySpy.updateLogout
    ).toHaveBeenCalledWith({
      sessionId: logoutData.sessionId,
    });
    expect(result).toEqual({
      message: "Logout realizado com sucesso",
      sessionId: logoutData.sessionId,
    });
  });

  test("should throw NotFoundError if session is not found", async () => {
    const { sut, authenticationRepositoryRepositorySpy, logoutData } =
      makeSut();

    authenticationRepositoryRepositorySpy.updateLogout.mockResolvedValue(
      undefined
    );

    await expect(sut.handle(logoutData)).rejects.toThrow(
      new NotFoundError("Sessão de autenticação não encontrada")
    );
    expect(
      authenticationRepositoryRepositorySpy.updateLogout
    ).toHaveBeenCalledWith({
      sessionId: logoutData.sessionId,
    });
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, authenticationRepositoryRepositorySpy, logoutData } =
      makeSut();

    authenticationRepositoryRepositorySpy.updateLogout.mockRejectedValue(
      new Error("Database error")
    );

    await expect(sut.handle(logoutData)).rejects.toThrow(
      new ServerError("Falha no logout do usuário: Database error")
    );
  });
});
