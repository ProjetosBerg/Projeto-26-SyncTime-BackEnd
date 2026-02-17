import { GetByIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByIdRecordTypesUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";

export const makeGetByIdRecordTypesUseCaseFactory = () => {
  return new GetByIdRecordTypeUseCase(new RecordTypeRepository());
};
