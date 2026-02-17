import { CreateRoutinesController } from "@/presentation/controllers/routines/createRoutinesController";
import { makeCreateRoutinesUseCaseFactory } from "../../usecase/routines/createRoutinesUseCaseFactory";

export const makeCreateRoutinesControllerFactory = () => {
  return new CreateRoutinesController(makeCreateRoutinesUseCaseFactory());
};
