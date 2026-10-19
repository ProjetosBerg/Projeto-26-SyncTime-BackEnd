import { In, IsNull, LessThanOrEqual, Not, Repository, getRepository } from "typeorm";
import { Notes } from "@/domain/entities/postgres/Notes";
import {
  DueReminder,
  ReminderRepositoryProtocol,
} from "../interfaces/reminderRepositoryProtocol";

export class ReminderRepository implements ReminderRepositoryProtocol {
  private readonly repository: Repository<Notes>;

  constructor() {
    this.repository = getRepository(Notes);
  }

  async findDue(now: Date, limit: number): Promise<DueReminder[]> {
    const notes = await this.repository.find({
      where: {
        reminderAt: LessThanOrEqual(now),
        reminderSentAt: IsNull(),
        status: Not(In(["Concluído", "Não Realizado"])),
      },
      relations: ["user", "routine"],
      order: { reminderAt: "ASC" },
      take: limit,
    });

    return notes.map((note) => ({
      id: note.id,
      user_id: note.user.id,
      routine_id: note.routine.id,
      activity: note.activity,
      startTime: note.startTime,
      dateOfNote: note.dateOfNote,
      reminderAt: note.reminderAt!,
    }));
  }

  async markAsSent(id: string, sentAt: Date): Promise<void> {
    await this.repository.update(
      { id, reminderSentAt: IsNull() },
      { reminderSentAt: sentAt }
    );
  }
}
