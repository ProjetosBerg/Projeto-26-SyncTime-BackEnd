import { CategoryModel } from "@/domain/models/postgres/CategoryModel";

export interface EditCategoryUseCaseProtocol {
  handle(data: EditCategoryUseCaseProtocol.Params): Promise<CategoryModel>;
}

export namespace EditCategoryUseCaseProtocol {
  export type Params = {
    categoryId: CategoryModel["id"];
    name: CategoryModel["name"];
    description?: CategoryModel["description"];
    type: CategoryModel["type"];
    recordTypeId: CategoryModel["record_type_id"];
    userId: CategoryModel["user_id"];
  };
}
