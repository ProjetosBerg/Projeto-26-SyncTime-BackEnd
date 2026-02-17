import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface DeleteCustomFieldUseCaseProtocol {
  handle(data: DeleteCustomFieldUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteCustomFieldUseCaseProtocol {
  export type Params = {
    customFieldsId: CustomFieldModel["id"];
    userId: CustomFieldModel["user_id"];
  };
}
