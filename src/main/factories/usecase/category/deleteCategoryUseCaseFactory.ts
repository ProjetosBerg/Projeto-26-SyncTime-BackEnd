import { DeleteCategoryUseCase } from "@/data/usecases/category/deleteCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeDeleteCategoryUseCaseFactory = () => {
  return new DeleteCategoryUseCase(
    new CategoryRepository(),
    new UserRepository()
  );
};
