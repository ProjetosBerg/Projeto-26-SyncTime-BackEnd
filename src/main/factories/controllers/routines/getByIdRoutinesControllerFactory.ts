import { GetByIdRoutinesController } from "@/presentation/controllers/routines/getByIdRoutinesController";
import { makeGetByIdRoutinesUseCaseFactory } from "../../usecase/routines/getByIdRoutinesUseCaseFactory";

export const makeGetByIdRoutinesControllerFactory = () => {
  return new GetByIdRoutinesController(makeGetByIdRoutinesUseCaseFactory());
};
