import { MonthlyRecordModel } from "@/domain/models/postgres/MonthlyRecordModel";
export interface DeleteMonthlyRecordUseCaseProtocol {
  handle(data: DeleteMonthlyRecordUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteMonthlyRecordUseCaseProtocol {
  export type Params = {
    monthlyRecordId: MonthlyRecordModel["id"];
    userId: MonthlyRecordModel["user_id"];
  };
}
