import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

export interface DeleteRoutinesUseCaseProtocol {
  handle(data: DeleteRoutinesUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteRoutinesUseCaseProtocol {
  export type Params = {
    routineId: RoutineModel["id"];
    userId: RoutineModel["user_id"];
  };
}
