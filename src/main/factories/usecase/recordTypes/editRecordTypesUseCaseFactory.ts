import { EditRecordTypeUseCase } from "@/data/usecases/recordTypes/editRecordTypeUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";

export const makeEditRecordTypesUseCaseFactory = () => {
  return new EditRecordTypeUseCase(new RecordTypeRepository());
};
