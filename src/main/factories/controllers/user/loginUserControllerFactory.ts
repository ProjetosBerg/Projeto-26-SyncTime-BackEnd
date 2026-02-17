import { makeLoginUserUseCaseFactory } from "../../usecase/users/loginUserUseCaseFactory";
import { LoginUserController } from "@/presentation/controllers/users/loginUserController";

export const makeLoginUserControllerFactory = () => {
  return new LoginUserController(makeLoginUserUseCaseFactory());
};
