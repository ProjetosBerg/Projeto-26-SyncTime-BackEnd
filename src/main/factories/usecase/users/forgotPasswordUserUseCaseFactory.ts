import UserAuth from "@/auth/users/userAuth";
import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeForgotPasswordUserUseCaseFactory = () => {
  return new ForgotPasswordUserUseCase(new UserRepository(), new UserAuth());
};
