import { UserRepository } from "@/infra/db/postgres/userRepository";
import { DeleteCustomFieldUseCase } from "@/data/usecases/customFields/deleteCustomFieldUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";

export const makeDeleteCustomFieldsUseCaseFactory = () => {
  return new DeleteCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository()
  );
};
