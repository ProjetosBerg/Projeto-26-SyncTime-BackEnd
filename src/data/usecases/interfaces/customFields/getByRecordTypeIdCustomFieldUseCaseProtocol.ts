import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface GetByRecordTypeIdCustomFieldUseCaseProtocol {
  handle(
    data: GetByRecordTypeIdCustomFieldUseCaseProtocol.Params
  ): Promise<{ customFields: CustomFieldModel[]; total: number }>;
}

export namespace GetByRecordTypeIdCustomFieldUseCaseProtocol {
  export type Params = {
    userId: CustomFieldModel["user_id"];
    categoryId: CustomFieldModel["category_id"];
    recordTypeId: number;
  };
}
