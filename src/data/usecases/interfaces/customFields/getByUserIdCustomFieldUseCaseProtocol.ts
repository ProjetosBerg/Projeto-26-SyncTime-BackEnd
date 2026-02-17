import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";

export interface GetByUserIdCustomFieldUseCaseProtocol {
  handle(
    data: GetByUserIdCustomFieldUseCaseProtocol.Params
  ): Promise<{ customFields: CustomFieldModel[]; total: number }>;
}

export namespace GetByUserIdCustomFieldUseCaseProtocol {
  export type Params = {
    userId: CustomFieldModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };
}
