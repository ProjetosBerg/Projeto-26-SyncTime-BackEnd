import { GetStreakUserController } from "@/presentation/controllers/users/getStreakUserController";
import { makeGetStreakUserUseCaseFactory } from "../../usecase/users/getStreakUserUseCaseFactory";

export const makeGetStreakUserControllerFactory = () => {
  return new GetStreakUserController(makeGetStreakUserUseCaseFactory());
};
