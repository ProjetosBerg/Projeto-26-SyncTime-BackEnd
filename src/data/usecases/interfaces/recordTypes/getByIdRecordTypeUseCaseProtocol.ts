import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface GetByIdRecordTypeUseCaseProtocol {
  handle(
    data: GetByIdRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel>;
}

export namespace GetByIdRecordTypeUseCaseProtocol {
  export type Params = {
    recordTypeId: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
  };
}
