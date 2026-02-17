import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

export const mockNotification: NotificationModel = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  user_id: "user-123",
  typeOfAction: "Criação",
  isRead: false,
  created_at: new Date(),
  updated_at: new Date(),
};
