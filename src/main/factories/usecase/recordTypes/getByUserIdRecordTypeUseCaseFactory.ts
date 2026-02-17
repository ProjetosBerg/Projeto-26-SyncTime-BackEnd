import { GetByUserIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByUserIdRecordTypesUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";

export const makeGetByUserIdRecordTypesUseCaseFactory = () => {
  return new GetByUserIdRecordTypeUseCase(new RecordTypeRepository());
};
