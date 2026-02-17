import { UserModel } from "./UserModel";

export type UserMonthlyEntryRankModel = {
  id?: string;
  userId: string;
  year: number;
  month: number;
  totalEntries: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserModel;
};
