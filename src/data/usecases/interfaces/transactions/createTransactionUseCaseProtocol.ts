import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { CustomFieldValueWithMetadata } from "../../transactions/utils/customFieldValueWithMetadata";

export interface CreateTransactionUseCaseProtocol {
  handle(data: CreateTransactionUseCaseProtocol.Params): Promise<{
    transaction: TransactionModelMock;
    customFields?: CustomFieldValueWithMetadata[];
  }>;
}

export namespace CreateTransactionUseCaseProtocol {
  export type Params = {
    title: TransactionModel["title"];
    description?: TransactionModel["description"];
    amount?: TransactionModel["amount"];
    transactionDate: TransactionModel["transaction_date"];
    monthlyRecordId: TransactionModel["monthly_record_id"];
    categoryId: TransactionModel["category_id"];
    userId: TransactionModel["user_id"];
    customFields?: { custom_field_id: string; value: any }[];
  };
}
