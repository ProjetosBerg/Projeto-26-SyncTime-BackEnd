import { UserRepository } from "@/infra/db/postgres/userRepository";
import { GetByIdCustomFieldUseCase } from "@/data/usecases/customFields/getByIdCustomFieldUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";

export const makeGetByIdCustomFieldsUseCaseFactory = () => {
  return new GetByIdCustomFieldUseCase(
    new CustomFieldsRepository(),
    new UserRepository()
  );
};
