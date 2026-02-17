import { GetByIdCategoryUseCase } from "@/data/usecases/category/getByIdCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeGetByIdCategoryUseCaseFactory = () => {
  return new GetByIdCategoryUseCase(
    new CategoryRepository(),
    new UserRepository()
  );
};
