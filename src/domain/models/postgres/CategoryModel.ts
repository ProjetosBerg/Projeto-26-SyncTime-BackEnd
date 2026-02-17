import { RecordTypeModel } from "./RecordTypesModel";
import { UserModel } from "./UserModel";
import { TransactionModel } from "./TransactionModel";
import { MonthlyRecordModel } from "./MonthlyRecordModel";

export type CategoryModel = {
  id?: string;
  name: string;
  description?: string;
  type: string;
  record_type_id?: RecordTypeModel["id"];
  record_type_name?: RecordTypeModel["name"];
  user_id?: UserModel["id"];
  monthly_records?: MonthlyRecordModel[];
  transactions?: TransactionModel[];
  created_at?: Date;
  updated_at?: Date;
};
