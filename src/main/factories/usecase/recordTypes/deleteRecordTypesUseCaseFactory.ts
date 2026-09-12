import { DeleteRecordTypeUseCase } from "@/data/usecases/recordTypes/deleteRecordTypeUseCase";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";
export const makeDeleteRecordTypesUseCaseFactory = () => {
  return new DeleteRecordTypeUseCase(
    new RecordTypeRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
