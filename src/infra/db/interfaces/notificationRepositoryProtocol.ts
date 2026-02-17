import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export interface NotificationRepositoryProtocol {
  create(
    data: NotificationRepositoryProtocol.CreateNotification
  ): Promise<NotificationModel>;
  findByIdAndUserId(
    data: NotificationRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<NotificationModel | null>;
  updateNotification(
    data: NotificationRepositoryProtocol.UpdateNotificationParams
  ): Promise<NotificationModel>;
  findByUserId(
    data: NotificationRepositoryProtocol.FindByUserIdParams
  ): Promise<{ notifications: NotificationModel[]; total: number }>;
  deleteNotifications(
    data: NotificationRepositoryProtocol.DeleteNotificationsParams
  ): Promise<void>;
  markAsReadNotifications(
    data: NotificationRepositoryProtocol.MarkAsReadNotificationsParams
  ): Promise<void>;
  countNewByUserId(
    data: NotificationRepositoryProtocol.CountNewByUserIdParams
  ): Promise<number>;
  updateAllNewToFalseByUserId(
    data: NotificationRepositoryProtocol.UpdateAllNewToFalseByUserIdParams
  ): Promise<void>;
}

export namespace NotificationRepositoryProtocol {
  export type CreateNotification = {
    title: NotificationModel["title"];
    entity: NotificationModel["entity"];
    idEntity: NotificationModel["idEntity"];
    userId: NotificationModel["user_id"];
    path?: NotificationModel["path"];
    payload?: NotificationModel["payload"];
    typeOfAction?: NotificationModel["typeOfAction"];
  };

  export type FindByIdAndUserIdParams = {
    id: NotificationModel["id"];
    userId: NotificationModel["user_id"];
  };

  export type UpdateNotificationParams = {
    isRead?: NotificationModel["isRead"];
    id: NotificationModel["id"];
    userId: NotificationModel["user_id"];
    path?: NotificationModel["path"];
    typeOfAction?: NotificationModel["typeOfAction"];
  };

  export type FindByUserIdParams = {
    userId: NotificationModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
    isRead?: boolean;
    typeOfAction?: string;
  };

  export type DeleteNotificationsParams = {
    ids: NotificationModel["id"][];
    userId: NotificationModel["user_id"];
  };

  export type MarkAsReadNotificationsParams = {
    ids: NotificationModel["id"][];
    userId: NotificationModel["user_id"];
  };

  export type CountNewByUserIdParams = {
    userId: NotificationModel["user_id"];
  };

  export type UpdateAllNewToFalseByUserIdParams = {
    userId: NotificationModel["user_id"];
  };
}
