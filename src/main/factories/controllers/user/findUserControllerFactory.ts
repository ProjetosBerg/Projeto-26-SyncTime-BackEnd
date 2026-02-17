import { FindUserByIdController } from "@/presentation/controllers/users/FindUserByIdController";
import { makeFindUserByIdUseCaseFactory } from "../../usecase/users/findUserUseCaseFactory";

export const makeFindUserByIdControllerFactory = () => {
  return new FindUserByIdController(makeFindUserByIdUseCaseFactory());
};
