import UserAuth from "@/auth/users/userAuth";
import { RefreshTokenUseCase } from "@/data/usecases/users/refreshTokenUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeRefreshTokenUseCaseFactory = (): RefreshTokenUseCase =>
  new RefreshTokenUseCase(
    new AuthenticationRepository(),
    new UserRepository(),
    new UserAuth()
  );
