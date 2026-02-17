import {
  MonthlyRecordModel,
  MonthlyRecordMock,
} from "@/domain/models/postgres/MonthlyRecordModel";
import { FilterParam } from "@/presentation/controllers/interfaces/FilterParam";

export interface GetByUserIdMonthlyRecordUseCaseProtocol {
  handle(
    data: GetByUserIdMonthlyRecordUseCaseProtocol.Params
  ): Promise<{ records: MonthlyRecordMock[]; total: number }>;
}

export namespace GetByUserIdMonthlyRecordUseCaseProtocol {
  export type Params = {
    categoryId: MonthlyRecordModel["category_id"];
    userId: MonthlyRecordModel["user_id"];
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
    filters?: FilterParam[];
  };
}
