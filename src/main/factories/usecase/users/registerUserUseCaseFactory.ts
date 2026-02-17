import UserAuth from "@/auth/users/userAuth";
import { RegisterUserUseCase } from "@/data/usecases/users/registerUserUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeRegisterUserUseCaseFactory = () => {
  return new RegisterUserUseCase(new UserRepository(), new UserAuth());
};
