import { GetByIdNotificationController } from "@/presentation/controllers/notification/getByIdNotificationController";
import { makeGetByIdNotificationUseCaseFactory } from "../../usecase/notification/getByIdNotificationUseCaseFactory";

export const makeGetByIdNotificationControllerFactory = () => {
  return new GetByIdNotificationController(
    makeGetByIdNotificationUseCaseFactory()
  );
};
