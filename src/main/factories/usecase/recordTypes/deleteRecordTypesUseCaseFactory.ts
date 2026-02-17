import { DeleteRecordTypeUseCase } from "@/data/usecases/recordTypes/deleteRecordTypeUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";
export const makeDeleteRecordTypesUseCaseFactory = () => {
  return new DeleteRecordTypeUseCase(new RecordTypeRepository());
};
