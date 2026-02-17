import { CategoryModel } from "./CategoryModel";
import { RoutineModel } from "./RoutinModel";
import { UserModel } from "./UserModel";

export interface Comment {
  author: string;
  text: string;
  created_at: Date;
  updated_at: Date;
}

export type NotesModel = {
  id?: string;
  status?: string;
  collaborators?: string[];
  priority?: string;
  category_id?: CategoryModel["id"];
  activity?: string;
  activityType?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  comments?: Comment[];
  routine_id?: RoutineModel["id"];
  user_id?: UserModel["id"];
  summaryDay?: string;
  created_at?: Date;
  updated_at?: Date;
  dateOfNote?: Date;
};
