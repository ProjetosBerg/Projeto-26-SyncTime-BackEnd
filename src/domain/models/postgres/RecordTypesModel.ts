import { UserModel } from "./UserModel";

export type RecordTypeModel = {
  id?: number;
  user_id: UserModel["id"];
  name: string;
  icone: string;
  created_at?: Date;
  updated_at?: Date;
};
