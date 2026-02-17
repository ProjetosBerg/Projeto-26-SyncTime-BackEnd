import { GetByUserIdRoutinesUseCase } from "@/data/usecases/routines/getByUserIdRoutinesUseCase";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeGetByUserIdRoutinesUseCaseFactory = () => {
  return new GetByUserIdRoutinesUseCase(new RoutinesRepository());
};
