import { CategoryModel } from "@/domain/models/postgres/CategoryModel";

export interface DeleteCategoryUseCaseProtocol {
  handle(data: DeleteCategoryUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteCategoryUseCaseProtocol {
  export type Params = {
    categoryId: CategoryModel["id"];
    userId: CategoryModel["user_id"];
  };
}
