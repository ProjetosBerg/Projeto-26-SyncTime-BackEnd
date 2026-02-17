import { GetCountNewNotificationUseCase } from "@/data/usecases/notification/getCountNewNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeGetCountNewNotificationUseCaseFactory = () => {
  return new GetCountNewNotificationUseCase(new NotificationRepository());
};
