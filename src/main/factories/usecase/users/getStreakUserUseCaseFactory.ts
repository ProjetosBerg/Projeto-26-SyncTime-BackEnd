import { GetStreakUserUseCase } from "@/data/usecases/users/getStreakUserUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";

export const makeGetStreakUserUseCaseFactory = () => {
  return new GetStreakUserUseCase(new AuthenticationRepository());
};
