import { GetByIdRoutinesUseCase } from "@/data/usecases/routines/getByIdRoutinesUseCase";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeGetByIdRoutinesUseCaseFactory = () => {
  return new GetByIdRoutinesUseCase(new RoutinesRepository());
};
