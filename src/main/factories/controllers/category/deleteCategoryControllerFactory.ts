import { DeleteCategoryController } from "@/presentation/controllers/category/deleteCategoryController";
import { makeDeleteCategoryUseCaseFactory } from "@/main/factories/usecase/category/deleteCategoryUseCaseFactory";

export const makeDeleteCategoryControllerFactory = () => {
  return new DeleteCategoryController(makeDeleteCategoryUseCaseFactory());
};
