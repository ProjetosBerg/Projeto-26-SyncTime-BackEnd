import { CreateCategoryUseCase } from "@/data/usecases/category/createCategoryUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { RecordTypeRepository } from "@/infra/db/postgres/recordTypesRepository";

export const makeCreateCategoryUseCaseFactory = () => {
  return new CreateCategoryUseCase(
    new CategoryRepository(),
    new RecordTypeRepository()
  );
};
