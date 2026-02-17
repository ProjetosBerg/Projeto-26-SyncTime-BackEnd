import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { CustomFieldValueWithMetadata } from "../../transactions/utils/customFieldValueWithMetadata";
import { FilterParam } from "@/presentation/controllers/interfaces/FilterParam";

export interface GetByUserIdTransactionUseCaseProtocol {
  handle(data: GetByUserIdTransactionUseCaseProtocol.Params): Promise<{
    transactions: Array<{
      transaction: TransactionModelMock;
      customFields?: CustomFieldValueWithMetadata[];
      recordTypeId?: number;
    }>;
    totalAmount: number;
  }>;
}

export namespace GetByUserIdTransactionUseCaseProtocol {
  export type Params = {
    userId: TransactionModel["user_id"];
    monthlyRecordId: TransactionModel["monthly_record_id"];
    sortBy?: string;
    order?: string;
    filters?: FilterParam[];
  };
}
