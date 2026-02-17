import { MonthlyRecordModel } from "./MonthlyRecordModel";
import { CategoryModel } from "./CategoryModel";
import { UserModel } from "./UserModel";
import { Transaction } from "@/domain/entities/postgres/Transaction";

export interface TransactionModel extends Transaction {
  id: Transaction["id"];
  title: Transaction["title"];
  description: Transaction["description"];
  amount?: Transaction["amount"];
  transaction_date: Transaction["transaction_date"];
  monthly_record_id?: MonthlyRecordModel["id"];
  category_id?: CategoryModel["id"];
  category_name?: CategoryModel["name"];
  user_id?: UserModel["id"];
  created_at: Transaction["created_at"];
  updated_at: Transaction["updated_at"];
}

export type TransactionModelMock = Omit<
  TransactionModel,
  | "save"
  | "remove"
  | "hasId"
  | "softRemove"
  | "recover"
  | "user"
  | "reload"
  | "category"
  | "monthly_record"
>;
