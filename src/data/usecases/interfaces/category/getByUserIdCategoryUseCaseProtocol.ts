import { CategoryModel } from "@/domain/models/postgres/CategoryModel";

export interface GetByUserIdCategoryUseCaseProtocol {
  handle(
    data: GetByUserIdCategoryUseCaseProtocol.Params
  ): Promise<{ categories: CategoryModel[]; total: number }>;
}

export namespace GetByUserIdCategoryUseCaseProtocol {
  export type Params = {
    userId: CategoryModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };
}
