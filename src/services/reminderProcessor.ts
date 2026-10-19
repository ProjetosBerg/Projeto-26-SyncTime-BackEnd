import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ReminderRepositoryProtocol } from "@/infra/db/interfaces/reminderRepositoryProtocol";
import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

export class ReminderProcessor {
  private processing = false;

  constructor(
    private readonly reminderRepository: ReminderRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async processDue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const reminders = await this.reminderRepository.findDue(new Date(), 100);

      for (const reminder of reminders) {
        try {
          const startTime = reminder.startTime?.slice(0, 5) || "horário definido";
          const notification = await this.notificationRepository.create({
            title: `Lembrete: ${reminder.activity} começa às ${startTime}`,
            entity: "Anotação",
            idEntity: reminder.id,
            userId: reminder.user_id,
            path: "/anotacoes",
            typeOfAction: "Lembrete",
            payload: {
              dateOfNote: reminder.dateOfNote,
              routine_id: reminder.routine_id,
              startTime: reminder.startTime,
            } as NotificationModel["payload"],
          });

          await this.reminderRepository.markAsSent(reminder.id, new Date());
          const countNewNotification =
            await this.notificationRepository.countNewByUserId({
              userId: reminder.user_id,
            });

          getIo()?.to(`user_${reminder.user_id}`).emit("newNotification", {
            id: notification.id,
            title: notification.title,
            entity: notification.entity,
            idEntity: notification.idEntity,
            path: notification.path,
            typeOfAction: notification.typeOfAction,
            payload: notification.payload,
            createdAt: notification.created_at,
            countNewNotification,
          });
        } catch (error) {
          logger.error(
            `Falha ao processar lembrete ${reminder.id}: ${String(error)}`
          );
        }
      }
    } catch (error) {
      logger.error(`Falha ao buscar lembretes pendentes: ${String(error)}`);
    } finally {
      this.processing = false;
    }
  }
}
