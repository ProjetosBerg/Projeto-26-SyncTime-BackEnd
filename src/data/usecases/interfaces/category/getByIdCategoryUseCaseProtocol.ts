import { CategoryModel } from "@/domain/models/postgres/CategoryModel";

export interface GetByIdCategoryUseCaseProtocol {
  handle(data: GetByIdCategoryUseCaseProtocol.Params): Promise<CategoryModel>;
}

export namespace GetByIdCategoryUseCaseProtocol {
  export type Params = {
    categoryId: CategoryModel["id"];
    userId: CategoryModel["user_id"];
  };
}
