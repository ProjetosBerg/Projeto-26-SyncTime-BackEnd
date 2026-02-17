import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface CreateCustomFieldUseCaseProtocol {
  handle(
    data: CreateCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel>;
}

export namespace CreateCustomFieldUseCaseProtocol {
  export type Params = {
    type: CustomFieldModel["type"] | string;
    label: CustomFieldModel["label"];
    description?: CustomFieldModel["description"];
    categoryId: CustomFieldModel["category_id"];
    recordTypeId: CustomFieldModel["record_type_id"];
    name: CustomFieldModel["name"];
    required: CustomFieldModel["required"];
    userId: CustomFieldModel["user_id"];
    options?: CustomFieldModel["options"];
  };
}
