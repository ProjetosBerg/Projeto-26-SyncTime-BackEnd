import { RoutineModel, Period } from "@/domain/models/postgres/RoutinModel";

export interface EditRoutinesUseCaseProtocol {
  handle(data: EditRoutinesUseCaseProtocol.Params): Promise<RoutineModel>;
}

export namespace EditRoutinesUseCaseProtocol {
  export type Params = {
    type?: RoutineModel["type"];
    period?: Period;
    routineId: RoutineModel["id"];
    userId: RoutineModel["user_id"];
  };
}
