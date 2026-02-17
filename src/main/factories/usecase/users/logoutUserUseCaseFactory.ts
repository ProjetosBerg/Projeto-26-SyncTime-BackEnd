import { LogoutUserUseCase } from "@/data/usecases/users/logoutUserUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";

export const makeLogoutUserUseCaseFactory = () => {
  return new LogoutUserUseCase(new AuthenticationRepository());
};
