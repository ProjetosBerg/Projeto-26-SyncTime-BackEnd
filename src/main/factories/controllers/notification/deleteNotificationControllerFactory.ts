import { DeleteNotificationController } from "@/presentation/controllers/notification/deleteNotificationController";
import { makeDeleteNotificationUseCaseFactory } from "../../usecase/notification/deleteNotificationUseCaseFactory";

export const makeDeleteNotificationControllerFactory = () => {
  return new DeleteNotificationController(
    makeDeleteNotificationUseCaseFactory()
  );
};
