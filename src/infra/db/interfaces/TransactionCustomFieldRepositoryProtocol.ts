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
  replaceByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.ReplaceByTransactionIdParams
  ): Promise<TransactionCustomFieldValueModel[]>;
  deleteByTransactionIds?(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByTransactionIdsParams
  ): Promise<void>;
  deleteByCustomFieldIds?(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByCustomFieldIdsParams
  ): Promise<void>;
  deleteByUserId?(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByUserIdParams
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
  export type ReplaceByTransactionIdParams = {
    transaction_id: string;
    user_id: string;
    values: Array<{
      custom_field_id: string;
      value: any;
    }>;
  };
  export type DeleteByTransactionIdsParams = {
    transaction_ids: string[];
    user_id: string;
  };
  export type DeleteByCustomFieldIdsParams = {
    custom_field_ids: string[];
    user_id: string;
  };
  export type DeleteByUserIdParams = {
    user_id: string;
  };
}
