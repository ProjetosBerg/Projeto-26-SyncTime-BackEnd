import { EditCategoryUseCase } from "@/data/usecases/category/editCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeEditCategoryUseCaseFactory = () => {
  return new EditCategoryUseCase(
    new CategoryRepository(),
    new RecordTypeRepository(),
    new UserRepository()
  );
};
