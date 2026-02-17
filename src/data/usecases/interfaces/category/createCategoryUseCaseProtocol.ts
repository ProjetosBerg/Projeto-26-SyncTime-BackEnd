import { CategoryModel } from "@/domain/models/postgres/CategoryModel";

export interface CreateCategoryUseCaseProtocol {
  handle(data: CreateCategoryUseCaseProtocol.Params): Promise<CategoryModel>;
}

export namespace CreateCategoryUseCaseProtocol {
  export type Params = {
    name: CategoryModel["name"];
    description?: CategoryModel["description"];
    type: CategoryModel["type"];
    recordTypeId: CategoryModel["record_type_id"];
    userId: CategoryModel["user_id"];
  };
}
