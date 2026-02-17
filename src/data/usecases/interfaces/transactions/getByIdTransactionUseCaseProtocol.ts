import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { CustomFieldValueWithMetadata } from "../../transactions/utils/customFieldValueWithMetadata";

export interface GetByIdTransactionUseCaseProtocol {
  handle(data: GetByIdTransactionUseCaseProtocol.Params): Promise<{
    transaction: TransactionModelMock;
    customFields?: CustomFieldValueWithMetadata[];
  }>;
}

export namespace GetByIdTransactionUseCaseProtocol {
  export type Params = {
    transactionId: TransactionModel["id"];
    userId: TransactionModel["user_id"];
  };
}
