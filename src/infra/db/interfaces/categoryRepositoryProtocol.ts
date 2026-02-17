import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
export interface CategoryModelWithRecordType extends CategoryModel {
  record_type_id: number | undefined;
  record_type_name: string | undefined;
  record_type_icone: string | undefined;
}

export interface CategoryRepositoryProtocol {
  create(
    data: CategoryRepositoryProtocol.CreateCategory
  ): Promise<CategoryModel>;
  findByNameAndUserId(
    data: CategoryRepositoryProtocol.FindByNameAndUserIdParams
  ): Promise<CategoryModel | null>;
  findByUserId(
    data: CategoryRepositoryProtocol.FindByUserIdParams
  ): Promise<{ categories: CategoryModelWithRecordType[]; total: number }>;
  findByIdAndUserId(
    data: CategoryRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<CategoryModel | null>;
  deleteCategory(
    data: CategoryRepositoryProtocol.DeleteCategoryParams
  ): Promise<void>;
  updateCategory(
    data: CategoryRepositoryProtocol.UpdateCategoryParams
  ): Promise<CategoryModel>;
}

export namespace CategoryRepositoryProtocol {
  export type CreateCategory = {
    name: CategoryModel["name"];
    description?: CategoryModel["description"];
    type: CategoryModel["type"];
    recordTypeId: CategoryModel["record_type_id"];
    userId: CategoryModel["user_id"];
  };

  export type FindByNameAndUserIdParams = {
    name: CategoryModel["name"];
    userId: CategoryModel["user_id"];
    recordTypeId: CategoryModel["record_type_id"];
  };

  export type FindByUserIdParams = {
    userId: CategoryModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };

  export type FindByIdAndUserIdParams = {
    id: CategoryModel["id"];
    userId: CategoryModel["user_id"];
  };
  export type DeleteCategoryParams = {
    id: CategoryModel["id"];
    userId: CategoryModel["user_id"];
  };

  export type UpdateCategoryParams = {
    id: string;
    name?: string;
    description?: string;
    type?: string;
    recordTypeId: number;
    userId: string;
  };
}
