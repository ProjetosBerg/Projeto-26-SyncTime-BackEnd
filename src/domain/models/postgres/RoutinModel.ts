import { Notes } from "@/domain/entities/postgres/Notes";
import { UserModel } from "./UserModel";

export type Period = "Manhã" | "Tarde" | "Noite";

export type RoutineModel = {
  id?: string;
  type: string;
  period?: Period;
  user_id?: UserModel["id"];
  notes?: Notes[];
  created_at?: Date;
  updated_at?: Date;
};
