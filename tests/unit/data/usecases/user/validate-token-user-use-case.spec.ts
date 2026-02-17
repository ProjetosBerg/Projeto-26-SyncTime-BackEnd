import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { ValidateTokenUseCase } from "@/data/usecases/users/validateTokenUseCase";
import { ServerError } from "@/data/errors/ServerError";
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

  test("should validate token when already logged in today", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();

    const sessionId = "existing-session-id";
    const validateDataWithSession = { ...validateData, sessionId };

    const now = new Date();
    const mockSession = {
      loginAt: now,
      lastEntryAt: new Date(now.getTime() - 2 * 60 * 1000),
    };

    authenticationRepositoryRepositorySpy.findActiveSession.mockResolvedValue(
      mockSession as any
    );

    const result = await sut.handle(validateDataWithSession);

    expect(
      authenticationRepositoryRepositorySpy.findActiveSession
    ).toHaveBeenCalledWith({
      userId: validateDataWithSession.userId,
      sessionId: validateDataWithSession.sessionId,
      isOrder: true,
    });
    expect(
      authenticationRepositoryRepositorySpy.incrementEntryCount
    ).toHaveBeenCalledWith({
      userId: validateDataWithSession.userId,
      sessionId: validateDataWithSession.sessionId,
      now: expect.any(Date),
    });
    expect(authenticationRepositoryRepositorySpy.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      valid: true,
      sessionId: validateDataWithSession.sessionId,
    });
  });

  test("should validate token and create new entry when not logged in today", async () => {
    const { sut, authenticationRepositoryRepositorySpy, validateData } =
      makeSut();

    authenticationRepositoryRepositorySpy.findActiveSession.mockResolvedValue(
      undefined
    );

    const result = await sut.handle(validateData);

    expect(
      authenticationRepositoryRepositorySpy.findActiveSession
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: validateData.userId,
        sessionId: expect.any(String),
        isOrder: true,
      })
    );
    expect(
      authenticationRepositoryRepositorySpy.incrementEntryCount
    ).not.toHaveBeenCalled();
    expect(authenticationRepositoryRepositorySpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: validateData.userId,
        loginAt: expect.any(Date),
        sessionId: expect.any(String),
        isOffensive: expect.any(Boolean),
      })
    );
    expect(result).toEqual({
      valid: true,
      sessionId: expect.any(String),
    });
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
        sessionId: expect.any(String),
      })
    );
  });
});
