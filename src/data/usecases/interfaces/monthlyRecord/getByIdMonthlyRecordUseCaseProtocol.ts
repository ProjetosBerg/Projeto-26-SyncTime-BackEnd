import {
  MonthlyRecordModel,
  MonthlyRecordMock,
} from "@/domain/models/postgres/MonthlyRecordModel";

export interface GetByIdMonthlyRecordUseCaseProtocol {
  handle(
    data: GetByIdMonthlyRecordUseCaseProtocol.Params
  ): Promise<MonthlyRecordMock>;
}

export namespace GetByIdMonthlyRecordUseCaseProtocol {
  export type Params = {
    monthlyRecordId: MonthlyRecordModel["id"];
    userId: MonthlyRecordModel["user_id"];
  };
}
