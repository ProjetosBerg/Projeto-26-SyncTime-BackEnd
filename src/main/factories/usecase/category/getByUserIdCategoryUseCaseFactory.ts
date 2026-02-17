import { GetByUserIdCategoryUseCase } from "@/data/usecases/category/getByUserIdCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeGetByUserIdCategoryUseCaseFactory = () => {
  return new GetByUserIdCategoryUseCase(
    new CategoryRepository(),
    new UserRepository()
  );
};
