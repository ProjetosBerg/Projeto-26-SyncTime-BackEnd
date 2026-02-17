import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

export interface GetByIdRoutinesUseCaseProtocol {
  handle(data: GetByIdRoutinesUseCaseProtocol.Params): Promise<RoutineModel>;
}

export namespace GetByIdRoutinesUseCaseProtocol {
  export type Params = {
    routineId: RoutineModel["id"];
    userId: RoutineModel["user_id"];
  };
}
