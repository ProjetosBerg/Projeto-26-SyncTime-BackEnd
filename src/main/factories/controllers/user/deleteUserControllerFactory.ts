import { DeleteUserByIdController } from "@/presentation/controllers/users/deleteUserByIdController";
import { makeDeleteUserByIdUseCaseFactory } from "../../usecase/users/deleteUserUseCaseFactory";

export const makeDeleteUserByIdControllerFactory = () => {
  return new DeleteUserByIdController(makeDeleteUserByIdUseCaseFactory());
};
