import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

export interface CreateRoutinesUseCaseProtocol {
  handle(
    data: CreateRoutinesUseCaseProtocol.Params
  ): Promise<RoutineModel | RoutineModel[]>;
}

export namespace CreateRoutinesUseCaseProtocol {
  export type Params = {
    type: RoutineModel["type"];
    period?: RoutineModel["period"];
    periods?: NonNullable<RoutineModel["period"]>[];
    userId: RoutineModel["user_id"];
    createdAt?: Date;
  };
}
