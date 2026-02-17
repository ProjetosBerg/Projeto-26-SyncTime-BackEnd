import { GetByIdNotificationUseCase } from "@/data/usecases/notification/getByIdNotificationUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeGetByIdNotificationUseCaseFactory = () => {
  return new GetByIdNotificationUseCase(new NotificationRepository());
};
