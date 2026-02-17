import { MarkReadNotificationUseCase } from "@/data/usecases/notification/markReadNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeMarkReadNotificationUseCaseFactory = () => {
  return new MarkReadNotificationUseCase(new NotificationRepository());
};
