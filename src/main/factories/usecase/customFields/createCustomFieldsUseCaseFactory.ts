import { CreateCustomFieldUseCase } from "@/data/usecases/customFields/createCustomFieldUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
export const makeCreateCustomFieldsUseCaseFactory = () => {
  return new CreateCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository(),
    new CategoryRepository()
  );
};
