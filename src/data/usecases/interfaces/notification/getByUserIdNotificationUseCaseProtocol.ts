import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface GetByUserIdNotificationUseCaseProtocol {
  handle(
    data: GetByUserIdNotificationUseCaseProtocol.Params
  ): Promise<{ notifications: NotificationModel[]; total: number }>;
}

export namespace GetByUserIdNotificationUseCaseProtocol {
  export type Params = {
    userId: NotificationModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
    isRead?: boolean;
    typeOfAction?: string;
  };
}
