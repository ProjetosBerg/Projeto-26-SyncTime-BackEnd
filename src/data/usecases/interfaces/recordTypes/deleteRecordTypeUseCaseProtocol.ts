import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface DeleteRecordTypeUseCaseProtocol {
  handle(
    data: DeleteRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel>;
}

export namespace DeleteRecordTypeUseCaseProtocol {
  export type Params = {
    recordTypeId: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
  };
}
