import { MonthlyRecordMock } from "@/domain/models/postgres/MonthlyRecordModel";
import { mockCategory } from "../category/mockCategory";

// Tipo somente com os dados

export const mockMonthlyRecord: MonthlyRecordMock = {
  id: "monthly-record-123",
  title: "Monthly Budget",
  description: "Budget for July 2025",
  goal: "Save $1000",
  status: "andamento",
  initial_balance: 500,
  month: 7,
  year: 2025,
  category_id: mockCategory.id!,
  user_id: mockCategory.user_id,
  category: mockCategory as any,
  transactions: [],
  created_at: new Date("2025-07-05T10:00:00Z"),
  updated_at: new Date("2025-07-05T10:00:00Z"),
};
