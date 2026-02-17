import { DeleteUserByIdUseCase } from "@/data/usecases/users/deleteUserByIdUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeDeleteUserByIdUseCaseFactory = () => {
  return new DeleteUserByIdUseCase(new UserRepository());
};
