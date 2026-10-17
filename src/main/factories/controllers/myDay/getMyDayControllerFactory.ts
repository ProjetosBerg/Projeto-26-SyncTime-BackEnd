import { GetMyDayController } from "@/presentation/controllers/myDay/getMyDayController";
import { makeGetMyDayUseCaseFactory } from "../../usecase/myDay/getMyDayUseCaseFactory";

export const makeGetMyDayControllerFactory = () => {
  return new GetMyDayController(makeGetMyDayUseCaseFactory());
};
