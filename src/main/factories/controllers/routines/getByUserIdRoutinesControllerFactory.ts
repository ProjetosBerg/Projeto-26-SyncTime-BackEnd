import { GetByUserIdRoutinesController } from "@/presentation/controllers/routines/getByUserIdRoutinesController";
import { makeGetByUserIdRoutinesUseCaseFactory } from "../../usecase/routines/getByUserIdRoutinesUseCaseFactory";

export const makeGetByUserIdRoutinesControllerFactory = () => {
  return new GetByUserIdRoutinesController(
    makeGetByUserIdRoutinesUseCaseFactory()
  );
};
