import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { IUser } from "@/auth/interface/IUserAuth";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { ServerError } from "@/data/errors/ServerError";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeUserRepositoryRepository =
  (): jest.Mocked<UserRepositoryProtocol> => ({
    findOne: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

export const makeUserAuthRepositoryRepository = (): jest.Mocked<UserAuth> => {
  const userAuth = new UserAuth() as jest.Mocked<UserAuth>;
  userAuth.hashPassword = jest.fn().mockResolvedValue("hashed_password");
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
  userAuth.createRefreshToken = jest.fn().mockReturnValue({
    token: "valid-refresh-token",
    hash: "valid-refresh-token-hash",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
  return userAuth;
};

export const makeAuthenticationRepositoryRepository = () => {
  return {
    create: jest.fn().mockResolvedValue(undefined),
    hasLoginToday: jest.fn().mockResolvedValue(false),
    findActiveSessionToday: jest.fn().mockResolvedValue(null),
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
  const userAuthRepositoryRepositorySpy = makeUserAuthRepositoryRepository();
  const userRepositoryRepositorySpy = makeUserRepositoryRepository();
  const authenticationRepositoryRepositorySpy =
    makeAuthenticationRepositoryRepository();
  const notificationRepositoryRepositorySpy = makeNotificationRepository();
  const userMonthlyEntryRankRepositoryRepository =
    makeUserMonthlyEntryRankRepositoryRepository();
  const sut = new LoginUserUseCase(
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
    authenticationRepositoryRepositorySpy,
    userMonthlyEntryRankRepositoryRepository,
    notificationRepositoryRepositorySpy
  );

  const loginData = {
    login: mockUser.login,
    password: mockUser.password,
  };

  return {
    sut,
    userRepositoryRepositorySpy,
    userAuthRepositoryRepositorySpy,
    authenticationRepositoryRepositorySpy,
    loginData,
  };
};

describe("LoginUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully login a user with valid credentials", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
      authenticationRepositoryRepositorySpy,
      loginData,
    } = makeSut();

    userRepositoryRepositorySpy.findOne.mockResolvedValue(mockUser);
    userAuthRepositoryRepositorySpy.comparePassword.mockResolvedValue(true);
    userAuthRepositoryRepositorySpy.createUserToken.mockResolvedValue({
      message: "Token created successfully",
      token: "valid_token",
      user: mockUser as IUser,
    });

    const result = await sut.handle(loginData);

    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: mockUser.login,
    });
    expect(
      userAuthRepositoryRepositorySpy.comparePassword
    ).toHaveBeenCalledWith(loginData.password, mockUser.password);
    expect(authenticationRepositoryRepositorySpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.id,
        loginAt: expect.any(Date),
        sessionId: expect.any(String),
        isOffensive: expect.any(Boolean),
        refreshTokenHash: "valid-refresh-token-hash",
        refreshTokenExpiresAt: new Date("2030-01-01T00:00:00.000Z"),
      })
    );
    expect(
      userAuthRepositoryRepositorySpy.createUserToken
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockUser.id,
        name: mockUser.name,
        login: mockUser.login,
        email: mockUser.email,
        sessionId: expect.any(String),
      })
    );
    expect(result).toEqual({
      message: "Token created successfully",
      token: "valid_token",
      refreshToken: "valid-refresh-token",
      user: mockUser,
    });
  });

  test("should return a generic error if user is not found", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
      loginData,
    } = makeSut();

    userRepositoryRepositorySpy.findOne.mockResolvedValue(null);

    await expect(sut.handle(loginData)).rejects.toThrow(
      new UnauthorizedError("Credenciais inválidas")
    );
    expect(userRepositoryRepositorySpy.findOne).toHaveBeenCalledWith({
      login: mockUser.login,
    });
    expect(userAuthRepositoryRepositorySpy.comparePassword).toHaveBeenCalledWith(
      loginData.password,
      "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    );
  });

  test("should return the same generic error if password is incorrect", async () => {
    const {
      sut,
      userRepositoryRepositorySpy,
      userAuthRepositoryRepositorySpy,
      loginData,
    } = makeSut();

    userRepositoryRepositorySpy.findOne.mockResolvedValue(mockUser);
    userAuthRepositoryRepositorySpy.comparePassword.mockResolvedValue(false);

    await expect(sut.handle(loginData)).rejects.toThrow(
      new UnauthorizedError("Credenciais inválidas")
    );
    expect(
      userAuthRepositoryRepositorySpy.comparePassword
    ).toHaveBeenCalledWith(loginData.password, mockUser.password);
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, userRepositoryRepositorySpy, loginData } = makeSut();

    userRepositoryRepositorySpy.findOne.mockRejectedValue(
      new Error("Database error")
    );

    await expect(sut.handle(loginData)).rejects.toThrow(
      new ServerError("Falha no login do usuário: Database error")
    );
  });
});
