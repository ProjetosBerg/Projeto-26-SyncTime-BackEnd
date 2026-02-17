import { CategoryModel } from "./CategoryModel";
import { UserModel } from "./UserModel";
import { MonthlyRecord } from "@/domain/entities/postgres/MonthlyRecord";
import { Transaction } from "@/domain/entities/postgres/Transaction";

export interface MonthlyRecordModel extends MonthlyRecord {
  id: MonthlyRecord["id"];
  title: MonthlyRecord["title"];
  description: MonthlyRecord["description"];
  goal: MonthlyRecord["goal"];
  initial_balance: MonthlyRecord["initial_balance"];
  month: MonthlyRecord["month"];
  year: MonthlyRecord["year"];
  status: MonthlyRecord["status"];
  category_id?: CategoryModel["id"];
  user_id?: UserModel["id"];
  created_at: MonthlyRecord["created_at"];
  updated_at: MonthlyRecord["updated_at"];
  category: MonthlyRecord["category"];
  transactions: Transaction[];
  monthly_record?: any;
}

export type MonthlyRecordMock = Omit<
  MonthlyRecordModel,
  "save" | "remove" | "hasId" | "softRemove" | "recover" | "user" | "reload"
>;
