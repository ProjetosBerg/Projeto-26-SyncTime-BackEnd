import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

export interface GetByUserIdRoutinesUseCaseProtocol {
  handle(
    data: GetByUserIdRoutinesUseCaseProtocol.Params
  ): Promise<{ routines: RoutineModel[]; total: number }>;
}

export namespace GetByUserIdRoutinesUseCaseProtocol {
  export type Params = {
    userId: RoutineModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
    year?: number;
    month?: number;
  };
}
