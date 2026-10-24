import { GoalModel } from "@/domain/models/postgres/GoalModel";

export interface GoalRepositoryProtocol {
  create(data: GoalRepositoryProtocol.CreateParams): Promise<GoalModel>;
  findByUserId(userId: string): Promise<GoalModel[]>;
  findByIdAndUserId(id: string, userId: string): Promise<GoalModel | null>;
  update(data: GoalRepositoryProtocol.UpdateParams): Promise<GoalModel>;
  delete(id: string, userId: string): Promise<boolean>;
}

export namespace GoalRepositoryProtocol {
  export type CreateParams = Omit<GoalModel, "id" | "user_id"> & {
    userId: string;
  };
  export type UpdateParams = Partial<
    Pick<GoalModel, "title" | "description" | "targetCount" | "startDate" | "endDate">
  > & { id: string; userId: string };
}
