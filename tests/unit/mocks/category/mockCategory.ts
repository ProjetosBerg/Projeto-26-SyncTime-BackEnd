import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { CategoryModelWithRecordType } from "@/infra/db/interfaces/categoryRepositoryProtocol";

export const mockCategory: CategoryModel = {
  id: "category-123",
  name: "Food",
  description: "Expenses related to food and dining",
  type: "expense",
  record_type_id: 1,
  user_id: "user-123",
  monthly_records: [],
  transactions: [],
  created_at: new Date("2025-07-05T10:00:00Z"),
  updated_at: new Date("2025-07-05T10:00:00Z"),
};

export const mockCategoryWithRecordType: CategoryModelWithRecordType = {
  id: "category-123",
  name: "Food",
  description: "Expenses related to food and dining",
  type: "expense",
  record_type_id: 1,
  record_type_name: "Expense",
  record_type_icone: "expense",
  user_id: "user-123",
  monthly_records: [],
  transactions: [],
  created_at: new Date("2025-07-05T10:00:00Z"),
  updated_at: new Date("2025-07-05T10:00:00Z"),
};
