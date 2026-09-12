import { DeleteUserByIdUseCase } from "@/data/usecases/users/deleteUserByIdUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeDeleteUserByIdUseCaseFactory = () => {
  return new DeleteUserByIdUseCase(
    new UserRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
