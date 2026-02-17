import { LogoutUserController } from "@/presentation/controllers/users/logoutUserController";
import { makeLogoutUserUseCaseFactory } from "../../usecase/users/logoutUserUseCaseFactory";

export const makeLogoutUserControllerFactory = () => {
  return new LogoutUserController(makeLogoutUserUseCaseFactory());
};
