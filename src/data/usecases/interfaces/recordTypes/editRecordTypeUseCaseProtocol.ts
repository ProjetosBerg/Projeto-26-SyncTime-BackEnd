import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface EditRecordTypeUseCaseProtocol {
  handle(data: EditRecordTypeUseCaseProtocol.Params): Promise<RecordTypeModel>;
}

export namespace EditRecordTypeUseCaseProtocol {
  export type Params = {
    recordTypeId: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
    name: RecordTypeModel["name"];
    icone: RecordTypeModel["icone"];
  };
}
