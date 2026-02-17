import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface GetByIdCustomFieldUseCaseProtocol {
  handle(
    data: GetByIdCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel>;
}

export namespace GetByIdCustomFieldUseCaseProtocol {
  export type Params = {
    customFieldsId: CustomFieldModel["id"];
    userId: CustomFieldModel["user_id"];
  };
}
