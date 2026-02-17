import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface EditCustomFieldUseCaseProtocol {
  handle(
    data: EditCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel>;
}

export namespace EditCustomFieldUseCaseProtocol {
  export type Params = {
    customFieldsId: CustomFieldModel["id"];
    userId: CustomFieldModel["user_id"];
    type?: CustomFieldModel["type"] | string;
    label?: CustomFieldModel["label"];
    name?: CustomFieldModel["name"];
    categoryId?: CustomFieldModel["category_id"];
    description?: CustomFieldModel["description"] | null;
    options?: CustomFieldModel["options"] | null;
    recordTypeId?: CustomFieldModel["record_type_id"];
    required?: CustomFieldModel["required"];
  };
}
