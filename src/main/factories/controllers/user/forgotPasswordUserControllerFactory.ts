import { ForgotPasswordController } from "@/presentation/controllers/users/forgotPasswordUserController";
import { makeForgotPasswordUserUseCaseFactory } from "../../usecase/users/forgotPasswordUserUseCaseFactory";

export const makeForgotPasswordUserControllerFactory = () => {
  return new ForgotPasswordController(makeForgotPasswordUserUseCaseFactory());
};
