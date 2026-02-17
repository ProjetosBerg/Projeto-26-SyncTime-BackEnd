import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface GetByIdNotificationUseCaseProtocol {
  handle(
    data: GetByIdNotificationUseCaseProtocol.Params
  ): Promise<NotificationModel>;
}

export namespace GetByIdNotificationUseCaseProtocol {
  export type Params = {
    userId: NotificationModel["user_id"];
    id: NotificationModel["id"];
  };
}
