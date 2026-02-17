import { GetByUserIdNotificationUseCase } from "@/data/usecases/notification/getByUserIdNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeGetByUserIdNotificationUseCaseFactory = () => {
  return new GetByUserIdNotificationUseCase(new NotificationRepository());
};
