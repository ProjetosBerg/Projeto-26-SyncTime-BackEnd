export type GoalStatus = "active" | "completed" | "expired";

export type GoalModel = {
  id?: string;
  title: string;
  description?: string | null;
  targetCount: number;
  startDate: string;
  endDate: string;
  progress?: number;
  percentage?: number;
  status?: GoalStatus;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
};
