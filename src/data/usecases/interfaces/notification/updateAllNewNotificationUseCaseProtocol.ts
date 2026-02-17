import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface UpdateAllNewNotificationUseCaseProtocol {
  handle(data: UpdateAllNewNotificationUseCaseProtocol.Params): Promise<void>;
}

export namespace UpdateAllNewNotificationUseCaseProtocol {
  export type Params = {
    userId: NotificationModel["user_id"];
  };
}
