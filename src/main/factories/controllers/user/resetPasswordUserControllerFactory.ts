import { ResetPasswordController } from "@/presentation/controllers/users/resetPasswordUserController";
import { makeResetPasswordUserUseCaseFactory } from "../../usecase/users/resetPasswordUserUseCaseFactory";

export const makeResetPasswordUserControllerFactory = () => {
  return new ResetPasswordController(makeResetPasswordUserUseCaseFactory());
};
