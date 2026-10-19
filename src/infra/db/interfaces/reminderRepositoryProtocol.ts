import { NotesModel } from "@/domain/models/postgres/NotesModel";

export type DueReminder = NotesModel & {
  id: string;
  user_id: string;
  routine_id: string;
  reminderAt: Date;
};

export interface ReminderRepositoryProtocol {
  findDue(now: Date, limit: number): Promise<DueReminder[]>;
  markAsSent(id: string, sentAt: Date): Promise<void>;
}
