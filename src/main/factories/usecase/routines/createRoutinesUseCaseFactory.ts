import { CreateRoutinesUseCase } from "@/data/usecases/routines/createRoutinesUseCase";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeCreateRoutinesUseCaseFactory = () => {
  return new CreateRoutinesUseCase(new RoutinesRepository());
};
