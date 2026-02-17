import { RegisterUserController } from "@/presentation/controllers/users/registerUserController";
import { makeRegisterUserUseCaseFactory } from "@/main/factories/usecase/users/registerUserUseCaseFactory";

export const makeRegisterUserControllerFactory = () => {
  return new RegisterUserController(makeRegisterUserUseCaseFactory());
};
