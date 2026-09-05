import UserAuth from "@/auth/users/userAuth";
import { ServerError } from "@/data/errors/ServerError";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { RefreshTokenUseCaseProtocol } from "../interfaces/users/refreshTokenUseCaseProtocol";

export class RefreshTokenUseCase implements RefreshTokenUseCaseProtocol {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly userAuth: UserAuth
  ) {}

  async handle(
    data: RefreshTokenUseCaseProtocol.Params
  ): Promise<RefreshTokenUseCaseProtocol.Result> {
    try {
      const findSession =
        this.authenticationRepository.findActiveByRefreshTokenHash?.bind(
          this.authenticationRepository
        );
      const rotateToken = this.authenticationRepository.rotateRefreshToken?.bind(
        this.authenticationRepository
      );

      if (!findSession || !rotateToken) {
        throw new ServerError("Repositório de refresh token não configurado");
      }

      const now = new Date();
      const currentHash = this.userAuth.hashRefreshToken(data.refreshToken);
      const session = await findSession({
        refreshTokenHash: currentHash,
        now,
      });

      if (!session) {
        throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
      }

      const user = await this.userRepository.findOne({ id: session.userId });
      if (!user || !user.id) {
        throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
      }

      const nextRefreshToken = this.userAuth.createRefreshToken();
      const rotatedSession = await rotateToken({
        currentRefreshTokenHash: currentHash,
        newRefreshTokenHash: nextRefreshToken.hash,
        newRefreshTokenExpiresAt: nextRefreshToken.expiresAt,
        now,
      });

      if (!rotatedSession) {
        throw new UnauthorizedError("Sessão expirada. Faça login novamente.");
      }

      const authResult = await this.userAuth.createUserToken({
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
        sessionId: session.sessionId,
      });

      if (!authResult.token) {
        throw new ServerError("Falha ao renovar o token de acesso");
      }

      return {
        token: authResult.token,
        refreshToken: nextRefreshToken.token,
        user: {
          ...authResult.user,
          sessionId: session.sessionId,
        },
      };
    } catch (error: any) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof ServerError
      ) {
        throw error;
      }

      throw new ServerError(
        `Falha ao renovar a sessão: ${error?.message || String(error)}`
      );
    }
  }
}
