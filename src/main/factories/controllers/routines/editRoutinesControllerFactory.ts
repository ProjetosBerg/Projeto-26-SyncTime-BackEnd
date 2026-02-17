import { EditRoutinesController } from "@/presentation/controllers/routines/editRoutinesController";
import { makeEditRoutinesUseCaseFactory } from "../../usecase/routines/editRoutinesUseCaseFactory";

export const makeEditRoutinesControllerFactory = () => {
  return new EditRoutinesController(makeEditRoutinesUseCaseFactory());
};
