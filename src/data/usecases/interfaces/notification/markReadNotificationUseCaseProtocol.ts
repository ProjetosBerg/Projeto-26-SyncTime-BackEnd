import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface MarkReadNotificationUseCaseProtocol {
  handle(data: MarkReadNotificationUseCaseProtocol.Params): Promise<void>;
}

export namespace MarkReadNotificationUseCaseProtocol {
  export type Params = {
    userId: NotificationModel["user_id"];
    ids: NotificationModel["id"][];
  };
}
