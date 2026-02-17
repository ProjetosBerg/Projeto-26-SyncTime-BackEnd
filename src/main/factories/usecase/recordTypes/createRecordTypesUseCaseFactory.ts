import { CreateRecordTypeUseCase } from "@/data/usecases/recordTypes/createRecordTypesUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";

export const makeCreateRecordTypesUseCaseFactory = () => {
  return new CreateRecordTypeUseCase(new RecordTypeRepository());
};
