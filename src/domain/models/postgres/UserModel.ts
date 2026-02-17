import { SecurityQuestionModel } from "./SecurityQuestionModel";
import { CategoryModel } from "./CategoryModel";
import { MonthlyRecordModel } from "./MonthlyRecordModel";
import { TransactionModel } from "./TransactionModel";

export type UserModel = {
  id?: string;
  name: string;
  login: string;
  email: string;
  password: string;
  imageUrl?: string;
  publicId?: string;
  security_questions: SecurityQuestionModel[];
  categories?: CategoryModel[];
  bio?: string;
  monthly_records?: MonthlyRecordModel[];
  transactions?: TransactionModel[];
  created_at?: Date;
  updated_at?: Date;
};
