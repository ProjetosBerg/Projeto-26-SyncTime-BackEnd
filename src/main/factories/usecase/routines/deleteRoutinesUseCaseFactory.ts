import { DeleteRoutinesUseCase } from "@/data/usecases/routines/deleteRoutinesUseCase";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeDeleteRoutinesUseCaseFactory = () => {
  return new DeleteRoutinesUseCase(new RoutinesRepository());
};
