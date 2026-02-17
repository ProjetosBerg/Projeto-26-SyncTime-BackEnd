import { GetByUserIdRankUserController } from "@/presentation/controllers/users/getByUserIdRankUserController";
import { makeGetByUserIdRankUseCaseFactory } from "../../usecase/users/getByUserIdRankUseCaseFactory";

export const makeGetByUserIdRankControllerFactory = () => {
  return new GetByUserIdRankUserController(makeGetByUserIdRankUseCaseFactory());
};
