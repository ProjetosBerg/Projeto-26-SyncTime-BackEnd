import { UserRepository } from "@/infra/db/postgres/userRepository";
import { DeleteCustomFieldUseCase } from "@/data/usecases/customFields/deleteCustomFieldUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeDeleteCustomFieldsUseCaseFactory = () => {
  return new DeleteCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository(),
    new TransactionCustomFieldRepository()
  );
};
