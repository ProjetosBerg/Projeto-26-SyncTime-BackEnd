import { TransactionCustomFieldValueModel } from "@/domain/models/mongo/TransactionCustomFieldValueModel";

export interface TransactionCustomFieldRepositoryProtocol {
  create(
    data: TransactionCustomFieldRepositoryProtocol.CreateParams
  ): Promise<TransactionCustomFieldValueModel>;
  findByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.FindByTransactionIdParams
  ): Promise<TransactionCustomFieldValueModel[]>;
  deleteByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByTransactionIdParams
  ): Promise<void>;
}

export namespace TransactionCustomFieldRepositoryProtocol {
  export type CreateParams = {
    transaction_id: string;
    custom_field_id: string;
    value: any;
    user_id?: string;
  };

  export type FindByTransactionIdParams = {
    transaction_id: string;
    user_id?: string;
  };

  export type DeleteByTransactionIdParams = {
    transaction_id: string;
    user_id?: string;
  };
}
