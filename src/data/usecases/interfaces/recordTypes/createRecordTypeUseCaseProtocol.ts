import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface CreateRecordTypeUseCaseProtocol {
  handle(
    data: CreateRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel>;
}

export namespace CreateRecordTypeUseCaseProtocol {
  export type Params = {
    userId: RecordTypeModel["user_id"];
    name: RecordTypeModel["name"];
    icone: RecordTypeModel["icone"];
  };
}
