import { UpdateAllNewNotificationController } from "@/presentation/controllers/notification/updateAllNewNotificationController";
import { makeUpdateAllNewNotificationUseCaseFactory } from "../../usecase/notification/updateAllNewNotificationUseCaseFactory";

export const makeGetUpdateAllNewNotificationControllerFactory = () => {
  return new UpdateAllNewNotificationController(
    makeUpdateAllNewNotificationUseCaseFactory()
  );
};
