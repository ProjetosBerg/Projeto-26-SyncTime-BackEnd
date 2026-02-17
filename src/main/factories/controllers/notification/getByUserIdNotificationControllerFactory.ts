import { GetByUserIdNotificationController } from "@/presentation/controllers/notification/getByUserIdNotificationController";
import { makeGetByUserIdNotificationUseCaseFactory } from "../../usecase/notification/getByUserIdNotificationUseCaseFactory";

export const makeGetByUserIdNotificationControllerFactory = () => {
  return new GetByUserIdNotificationController(
    makeGetByUserIdNotificationUseCaseFactory()
  );
};
