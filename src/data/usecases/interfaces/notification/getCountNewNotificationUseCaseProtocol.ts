import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface GetCountNewNotificationUseCaseProtocol {
  handle(data: GetCountNewNotificationUseCaseProtocol.Params): Promise<number>;
}

export namespace GetCountNewNotificationUseCaseProtocol {
  export type Params = {
    userId: NotificationModel["user_id"];
  };
}
