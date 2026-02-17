import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface CustomFieldsRepositoryProtocol {
  create(
    data: CustomFieldsRepositoryProtocol.CreateCustomFieldParams
  ): Promise<CustomFieldModel>;
  findByNameAndUserId(
    data: CustomFieldsRepositoryProtocol.findByNameAndUserIdParams
  ): Promise<CustomFieldModel | null>;
  findByUserId(
    data: CustomFieldsRepositoryProtocol.findByUserIdParams
  ): Promise<{ customFields: CustomFieldModel[]; total: number }>;
  findByRecordTypeId(
    data: CustomFieldsRepositoryProtocol.findByRecordTypeIdParams
  ): Promise<{ customFields: CustomFieldModel[]; total: number }>;
  findByIdAndUserId(
    data: CustomFieldsRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<CustomFieldModel | null>;
  findByIdsAndUserId(
    data: CustomFieldsRepositoryProtocol.FindByIdsAndUserIdParams
  ): Promise<CustomFieldModel[] | null>;
  update(
    data: CustomFieldsRepositoryProtocol.UpdateParams
  ): Promise<CustomFieldModel>;
  delete(data: CustomFieldsRepositoryProtocol.DeleteParams): Promise<void>;
}

export namespace CustomFieldsRepositoryProtocol {
  export type CreateCustomFieldParams = {
    type: CustomFieldModel["type"];
    label: CustomFieldModel["label"];
    description?: CustomFieldModel["description"];
    category_id: CustomFieldModel["category_id"];
    record_type_id: CustomFieldModel["record_type_id"];
    name: CustomFieldModel["name"];
    required: CustomFieldModel["required"];
    user_id: CustomFieldModel["user_id"];
    options?: CustomFieldModel["options"];
  };

  export type findByNameAndUserIdParams = {
    name: CustomFieldModel["name"];
    user_id: CustomFieldModel["user_id"];
  };

  export type findByUserIdParams = {
    user_id: CustomFieldModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };
  export type findByRecordTypeIdParams = {
    user_id: CustomFieldModel["user_id"];
    category_id: CustomFieldModel["category_id"];
    record_type_id: number;
  };

  export type FindByIdsAndUserIdParams = {
    ids: CustomFieldModel["id"][];
    user_id: CustomFieldModel["user_id"];
  };

  export type FindByIdAndUserIdParams = {
    id: CustomFieldModel["id"];
    user_id: CustomFieldModel["user_id"];
  };

  export type UpdateParams = {
    id: CustomFieldModel["id"];
    user_id: CustomFieldModel["user_id"];
    type?: CustomFieldModel["type"];
    label?: CustomFieldModel["label"];
    name?: CustomFieldModel["name"];
    category_id?: CustomFieldModel["category_id"];
    description?: CustomFieldModel["description"] | null;
    options?: CustomFieldModel["options"] | null;
    record_type_id?: CustomFieldModel["record_type_id"];
    required?: CustomFieldModel["required"];
  };
  export type DeleteParams = {
    id: CustomFieldModel["id"];
    user_id: CustomFieldModel["user_id"];
  };
}
