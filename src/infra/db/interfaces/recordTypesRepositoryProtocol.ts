import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";

export interface RecordTypesRepositoryProtocol {
  create(
    data: RecordTypesRepositoryProtocol.CreateRecordTypesParams
  ): Promise<RecordTypeModel>;
  findByNameAndUserId(
    data: RecordTypesRepositoryProtocol.FindByNameAndUserIdParams
  ): Promise<RecordTypeModel | null>;
  findByUserId(
    data: RecordTypesRepositoryProtocol.FindByUserIdParams
  ): Promise<{ recordTypes: RecordTypeModel[]; total: number }>;

  findByIdRecordType(
    data: RecordTypesRepositoryProtocol.FindByIdRecordTypeParams
  ): Promise<RecordTypeModel | null>;
  updateRecordTypes(
    data: RecordTypesRepositoryProtocol.UpdateRecordTypes
  ): Promise<RecordTypeModel>;

  deleteRecordTypes(
    data: RecordTypesRepositoryProtocol.DeleteRecordTypesParams
  ): Promise<void>;
}

export namespace RecordTypesRepositoryProtocol {
  export type FindByNameAndUserIdParams = {
    name: RecordTypeModel["name"];
    userId: RecordTypeModel["user_id"];
  };

  export type CreateRecordTypesParams = {
    name: RecordTypeModel["name"];
    userId: RecordTypeModel["user_id"];
    icone: RecordTypeModel["icone"];
  };

  export type FindByUserIdParams = {
    userId: RecordTypeModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };

  export type FindByIdRecordTypeParams = {
    id: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
  };

  export type UpdateRecordTypes = {
    id: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
    name: RecordTypeModel["name"];
    icone: RecordTypeModel["icone"];
  };

  export type DeleteRecordTypesParams = {
    id: RecordTypeModel["id"];
    userId: RecordTypeModel["user_id"];
  };
}
