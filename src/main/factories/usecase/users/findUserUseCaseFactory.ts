import { FindUserByIdUseCase } from "@/data/usecases/users/findUserByIdUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeFindUserByIdUseCaseFactory = () => {
  return new FindUserByIdUseCase(new UserRepository());
};
