import { makeGetCountNewNotificationUseCaseFactory } from "../../usecase/notification/getCountNewNotificationUseCaseFactory";
import { GetCountNewNotificationController } from "@/presentation/controllers/notification/getCountNewNotificationController";

export const makeGetCountNewNotificationControllerFactory = () => {
  return new GetCountNewNotificationController(
    makeGetCountNewNotificationUseCaseFactory()
  );
};
