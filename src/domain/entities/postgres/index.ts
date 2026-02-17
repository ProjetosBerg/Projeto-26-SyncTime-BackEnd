import { User } from "@/domain/entities/postgres/User";
import { RecordTypes } from "@/domain/entities/postgres/RecordTypes";
import { SecurityQuestion } from "@/domain/entities/postgres/SecurityQuestion";
import { Category } from "@/domain/entities/postgres/Category";
import { MonthlyRecord } from "@/domain/entities/postgres/MonthlyRecord";
import { Transaction } from "@/domain/entities/postgres/Transaction";
import { Routines } from "@/domain/entities/postgres/Routines";
import { Notes } from "@/domain/entities/postgres/Notes";
import { Authentication } from "@/domain/entities/postgres/Authentication";
import { Notification } from "@/domain/entities/postgres/Notification";
import { UserMonthlyEntryRank } from "./UserMonthlyEntryRank";

export default {
  User,
  SecurityQuestion,
  RecordTypes,
  Category,
  MonthlyRecord,
  Transaction,
  Routines,
  Notes,
  Authentication,
  Notification,
  UserMonthlyEntryRank,
};
