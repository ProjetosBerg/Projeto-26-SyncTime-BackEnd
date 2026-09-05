import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { ValidateTokenUseCase } from "@/data/usecases/users/validateTokenUseCase";
import { ServerError } from "@/data/errors/ServerError";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeAuthenticationRepositoryRepository =
  (): jest.Mocked<AuthenticationRepositoryProtocol> => {
    return {
      findActiveSession: jest.fn().mockResolvedValue(null),
      incrementEntryCount: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
      findActiveSessionToday: jest.fn().mockResolvedValue(null),
      findByUserAndPeriod: jest.fn().mockResolvedValue([]),
      ...({} as any),
    };
  };

export const makeUserMonthlyEntryRankRepositoryRepository = () => {
  return {
    findByUserIdAndYearAndMonth: jest.fn().mockResolvedValue(null),
    updateTotalForUserAndMonth: jest.fn().mockResolvedValue(undefined),
    updateLastPositionLossNotification: jest.fn().mockResolvedValue(undefined),
    getUsersWhoLostPositions: jest.fn().mockResolvedValue([]),
    getAllRankedForMonth: jest.fn().mockResolvedValue([]),
    findUsersWhoLostPositions: jest.fn().mockResolvedValue([]),
    findByUserId: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    getAllRankedForYear: jest.fn().mockResolvedValue([]),
    getAllRankedForMonthAndYear: jest.fn().mockResolvedValue([]),
    getAllRankedForMonthAndYearWithPositionLoss: jest
      .fn()
      .mockResolvedValue([]),
    getAllRankedForMonthAndYearWithPositionLossAndNotification: jest
      .fn()
      .mockResolvedValue([]),
    getAllRankedForMonthAndYearWithNotification: jest
      .fn()
      .mockResolvedValue([]),
    ...({} as any),
  };
};

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const authenticationRepositoryRepositorySpy =
    makeAuthenticationRepositoryRepository();

  const notificationRepositoryRepositorySpy = makeNotificationRepository();
  const userMonthlyEntryRankRepositoryRepository =
    makeUserMonthlyEntryRankRepositoryRepository();
  const sut = new ValidateTokenUseCase(
    authenticationRepositoryRepositorySpy,
    userMonthlyEntryRankRepositoryRepository,
    notificationRepositoryRepositorySpy
  );

  const validateData = {
    userId: "mock-user-id",
    sessionId: "existing-session-id",
  };

  return {
    sut,
    authenticationRepositoryRepositorySpy,
    validateData,
  };
};

describe("ValidateTokenUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should increment an active session from the current day", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();

    const now = new Date();
    const mockSession = {
      loginAt: now,
      lastEntryAt: new Date(now.getTime() - 2 * 60 * 1000),
    };

    authenticationRepositoryRepositorySpy.findActiveSession.mockResolvedValue(
      mockSession as any
    );

    const result = await sut.handle(validateData);

    expect(
      authenticationRepositoryRepositorySpy.findActiveSession
    ).toHaveBeenCalledWith({
      userId: validateData.userId,
      sessionId: validateData.sessionId,
      isOrder: true,
    });
    expect(
      authenticationRepositoryRepositorySpy.incrementEntryCount
    ).toHaveBeenCalledWith({
      userId: validateData.userId,
      sessionId: validateData.sessionId,
      now: expect.any(Date),
    });
    expect(authenticationRepositoryRepositorySpy.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      valid: true,
      sessionId: validateData.sessionId,
    });
  });

  test("should create only a daily presence row for an active session from a previous day", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();
    const now = new Date();

    authenticationRepositoryRepositorySpy.findActiveSession.mockResolvedValue({
      loginAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      lastEntryAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    } as any);

    await sut.handle(validateData);

    expect(
      authenticationRepositoryRepositorySpy.incrementEntryCount
    ).not.toHaveBeenCalled();
    expect(authenticationRepositoryRepositorySpy.create).toHaveBeenCalledWith({
      userId: validateData.userId,
      sessionId: validateData.sessionId,
      loginAt: expect.any(Date),
      isOffensive: expect.any(Boolean),
    });
  });

  test("should reject an inactive session instead of creating a new one", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();

    authenticationRepositoryRepositorySpy.findActiveSession.mockResolvedValue(
      undefined
    );

    await expect(sut.handle(validateData)).rejects.toThrow(
      new UnauthorizedError("Sessão inválida ou expirada")
    );

    expect(
      authenticationRepositoryRepositorySpy.findActiveSession
    ).toHaveBeenCalledWith({
      userId: validateData.userId,
      sessionId: validateData.sessionId,
      isOrder: true,
    });
    expect(
      authenticationRepositoryRepositorySpy.incrementEntryCount
    ).not.toHaveBeenCalled();
    expect(authenticationRepositoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();

    const dbError = new Error("Database error");
    authenticationRepositoryRepositorySpy.findActiveSession.mockRejectedValue(
      dbError
    );

    await expect(sut.handle(validateData)).rejects.toThrow(
      new ServerError("Falha na validação do token: Database error")
    );
    expect(
      authenticationRepositoryRepositorySpy.findActiveSession
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: validateData.userId,
        sessionId: validateData.sessionId,
      })
    );
  });
});
