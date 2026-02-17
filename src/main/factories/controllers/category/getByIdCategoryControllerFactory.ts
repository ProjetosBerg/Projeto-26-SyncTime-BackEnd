import { GetByIdCategoryController } from "@/presentation/controllers/category/getByIdCategoryController";
import { makeGetByIdCategoryUseCaseFactory } from "@/main/factories/usecase/category/getByIdCategoryUseCaseFactory";

export const makeGetByIdCategoryControllerFactory = () => {
  return new GetByIdCategoryController(makeGetByIdCategoryUseCaseFactory());
};
