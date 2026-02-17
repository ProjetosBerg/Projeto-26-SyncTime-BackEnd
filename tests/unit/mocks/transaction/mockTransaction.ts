import { TransactionModelMock } from "@/domain/models/postgres/TransactionModel";
import { mockCategory } from "../category/mockCategory";
import { mockMonthlyRecord } from "../monthlyRecord/mockMonthlyRecord";

export const mockTransaction: TransactionModelMock = {
  id: "transaction-123",
  title: "teste",
  description: "teste",
  amount: 150.75,
  transaction_date: new Date("2025-07-02"),
  monthly_record_id: mockMonthlyRecord.id,
  category_id: mockCategory.id,
  category_name: mockCategory.name,
  user_id: "user-123",
  created_at: new Date(),
  updated_at: new Date(),
};
