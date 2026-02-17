import { TransactionModel } from "../postgres/TransactionModel";
import { CustomFieldModel } from "./CustomFieldModel";
import { UserModel } from "../postgres/UserModel";

export type TransactionCustomFieldValueModel = {
  id?: string;
  transaction_id: TransactionModel["id"];
  custom_field_id: CustomFieldModel["id"];
  value: any;
  user_id: UserModel["id"];
  created_at?: Date;
  updated_at?: Date;
};
