import { DeleteNotificationUseCase } from "@/data/usecases/notification/deleteNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeDeleteNotificationUseCaseFactory = () => {
  return new DeleteNotificationUseCase(new NotificationRepository());
};
