import { UpdateAllNewNotificationUseCase } from "@/data/usecases/notification/updateAllNewNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeUpdateAllNewNotificationUseCaseFactory = () => {
  return new UpdateAllNewNotificationUseCase(new NotificationRepository());
};
