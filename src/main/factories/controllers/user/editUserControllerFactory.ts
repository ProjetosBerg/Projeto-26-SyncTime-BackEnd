import { EditUserByIdController } from "@/presentation/controllers/users/editUserByIdController";
import { makeEditUserByIdUseCaseFactory } from "../../usecase/users/editUserUseCaseFactory";

export const makeEditUserByIdControllerFactory = () => {
  return new EditUserByIdController(makeEditUserByIdUseCaseFactory());
};
