import { UserRepository } from "@/infra/db/postgres/userRepository";
import { GetByUserIdCustomFieldUseCase } from "@/data/usecases/customFields/getByUserIdCustomFieldUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";

export const makeGetByUserIdCustomFieldsUseCaseFactory = () => {
  return new GetByUserIdCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository()
  );
};
