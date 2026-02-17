import {
  MonthlyRecordModel,
  MonthlyRecordMock,
} from "@/domain/models/postgres/MonthlyRecordModel";

export interface EditMonthlyRecordUseCaseProtocol {
  handle(
    data: EditMonthlyRecordUseCaseProtocol.Params
  ): Promise<MonthlyRecordMock>;
}

export namespace EditMonthlyRecordUseCaseProtocol {
  export type Params = {
    monthlyRecordId: MonthlyRecordModel["id"];
    userId: MonthlyRecordModel["user_id"];
    title?: MonthlyRecordModel["title"];
    description?: MonthlyRecordModel["description"] | null;
    goal?: MonthlyRecordModel["goal"];
    initial_balance?: MonthlyRecordModel["initial_balance"] | null;
    categoryId?: MonthlyRecordModel["category_id"];
    status?: MonthlyRecordModel["status"];
  };
}
