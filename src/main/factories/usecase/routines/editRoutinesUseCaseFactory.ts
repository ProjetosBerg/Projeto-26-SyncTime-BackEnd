import { EditRoutinesUseCase } from "@/data/usecases/routines/editRoutinesUseCase";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeEditRoutinesUseCaseFactory = () => {
  return new EditRoutinesUseCase(new RoutinesRepository());
};
