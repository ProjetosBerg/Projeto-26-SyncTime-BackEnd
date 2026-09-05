import UserAuth from "@/auth/users/userAuth";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";
import { RefreshTokenUseCase } from "@/data/usecases/users/refreshTokenUseCase";
import { Authentication } from "@/domain/entities/postgres/Authentication";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";

const makeSut = () => {
  const session = {
    userId: mockUser.id,
    sessionId: "session-id",
  } as Authentication;
  const authenticationRepository = {
    findActiveByRefreshTokenHash: jest.fn().mockResolvedValue(session),
    rotateRefreshToken: jest.fn().mockResolvedValue(session),
    ...({} as AuthenticationRepositoryProtocol),
  } as jest.Mocked<AuthenticationRepositoryProtocol>;
  const userRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    ...({} as UserRepositoryProtocol),
  } as jest.Mocked<UserRepositoryProtocol>;
  const userAuth = new UserAuth() as jest.Mocked<UserAuth>;
  userAuth.hashRefreshToken = jest.fn().mockReturnValue("current-hash");
  userAuth.createRefreshToken = jest.fn().mockReturnValue({
    token: "next-refresh-token",
    hash: "next-hash",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  });
  userAuth.createUserToken = jest.fn().mockResolvedValue({
    message: "Token renovado",
    token: "next-access-token",
    user: {
      id: mockUser.id!,
      name: mockUser.name,
      login: mockUser.login,
      email: mockUser.email,
      sessionId: session.sessionId,
    },
  });

  return {
    sut: new RefreshTokenUseCase(
      authenticationRepository,
      userRepository,
      userAuth
    ),
    authenticationRepository,
    userRepository,
    userAuth,
    session,
  };
};

describe("RefreshTokenUseCase", () => {
  test("rotates the refresh token and returns a new access token", async () => {
    const { sut, authenticationRepository, userAuth } = makeSut();

    const result = await sut.handle({ refreshToken: "current-refresh-token" });

    expect(userAuth.hashRefreshToken).toHaveBeenCalledWith(
      "current-refresh-token"
    );
    expect(authenticationRepository.rotateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        currentRefreshTokenHash: "current-hash",
        newRefreshTokenHash: "next-hash",
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        token: "next-access-token",
        refreshToken: "next-refresh-token",
      })
    );
  });

  test("rejects an expired or unknown refresh token", async () => {
    const { sut, authenticationRepository } = makeSut();
    authenticationRepository.findActiveByRefreshTokenHash!.mockResolvedValue(
      undefined
    );

    await expect(
      sut.handle({ refreshToken: "expired-refresh-token" })
    ).rejects.toThrow(
      new UnauthorizedError("Sessão expirada. Faça login novamente.")
    );
    expect(authenticationRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  test("rejects reuse when token rotation loses the race", async () => {
    const { sut, authenticationRepository } = makeSut();
    authenticationRepository.rotateRefreshToken!.mockResolvedValue(undefined);

    await expect(
      sut.handle({ refreshToken: "reused-refresh-token" })
    ).rejects.toThrow(
      new UnauthorizedError("Sessão expirada. Faça login novamente.")
    );
  });
});
