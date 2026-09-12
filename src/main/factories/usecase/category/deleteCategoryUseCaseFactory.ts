import { DeleteCategoryUseCase } from "@/data/usecases/category/deleteCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeDeleteCategoryUseCaseFactory = () => {
  return new DeleteCategoryUseCase(
    new CategoryRepository(),
    new UserRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
