import { GetPresenceUserUseCase } from "@/data/usecases/users/getPresenceUserUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";

export const makeGetPresenceUserUseCaseFactory = () => {
  return new GetPresenceUserUseCase(new AuthenticationRepository());
};
