import { DeleteRoutinesController } from "@/presentation/controllers/routines/deleteRoutinesController";
import { makeDeleteRoutinesUseCaseFactory } from "../../usecase/routines/deleteRoutinesUseCaseFactory";

export const makeDeleteRoutinesControllerFactory = () => {
  return new DeleteRoutinesController(makeDeleteRoutinesUseCaseFactory());
};
