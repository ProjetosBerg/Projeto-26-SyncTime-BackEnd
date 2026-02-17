import { MarkReadNotificationController } from "@/presentation/controllers/notification/markReadNotificationController";
import { makeMarkReadNotificationUseCaseFactory } from "../../usecase/notification/markReadNotificationUseCaseFactory";

export const makeMarkReadNotificationControllerFactory = () => {
  return new MarkReadNotificationController(
    makeMarkReadNotificationUseCaseFactory()
  );
};
