import { UserModel } from "./UserModel";

export type NotificationModel = {
  id?: string;
  title?: string;
  entity?: string;
  idEntity?: string;
  isRead?: boolean;
  isNew?: boolean;
  path?: string;
  payload?: Record<string, any>;
  typeOfAction?: string;
  user_id?: UserModel["id"];
  created_at?: Date;
  updated_at?: Date;
};
