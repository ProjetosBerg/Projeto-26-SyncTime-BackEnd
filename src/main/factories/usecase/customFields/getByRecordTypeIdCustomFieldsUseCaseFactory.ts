import { UserRepository } from "@/infra/db/postgres/userRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { GetByRecordTypeIdCustomFieldUseCase } from "@/data/usecases/customFields/getByRecordTypeIdCustomFieldUseCase";

export const makeGetByRecordTypeIdCustomFieldsUseCaseFactory = () => {
  return new GetByRecordTypeIdCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository()
  );
};
