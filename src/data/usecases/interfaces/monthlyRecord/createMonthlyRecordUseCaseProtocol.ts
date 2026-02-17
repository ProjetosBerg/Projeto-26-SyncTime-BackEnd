import {
  MonthlyRecordMock,
  MonthlyRecordModel,
} from "@/domain/models/postgres/MonthlyRecordModel";

export interface CreateMonthlyRecordUseCaseProtocol {
  handle(
    data: CreateMonthlyRecordUseCaseProtocol.Params
  ): Promise<MonthlyRecordMock>;
}

export namespace CreateMonthlyRecordUseCaseProtocol {
  export type Params = {
    title: MonthlyRecordModel["title"];
    description?: MonthlyRecordModel["description"];
    goal: MonthlyRecordModel["goal"];
    status: MonthlyRecordModel["status"];
    initial_balance?: MonthlyRecordModel["initial_balance"];
    month: MonthlyRecordModel["month"];
    year: MonthlyRecordModel["year"];
    categoryId: MonthlyRecordModel["category_id"];
    userId: MonthlyRecordModel["user_id"];
  };
}
