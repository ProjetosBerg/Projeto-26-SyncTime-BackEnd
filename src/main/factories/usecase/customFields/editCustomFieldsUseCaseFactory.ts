import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { EditCustomFieldUseCase } from "@/data/usecases/customFields/editCustomFieldUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";

export const makeEditCustomFieldsUseCaseFactory = () => {
  return new EditCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository(),
    new CategoryRepository()
  );
};
