import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface GetByUserIdRecordTypeUseCaseProtocol {
  handle(
    data: GetByUserIdRecordTypeUseCaseProtocol.Params
  ): Promise<{ recordTypes: RecordTypeModel[]; total: number }>;
}

export namespace GetByUserIdRecordTypeUseCaseProtocol {
  export type Params = {
    userId: RecordTypeModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };
}
