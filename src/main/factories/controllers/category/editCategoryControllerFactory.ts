import { EditCategoryController } from "@/presentation/controllers/category/editCategoryController";
import { makeEditCategoryUseCaseFactory } from "../../usecase/category/editCategoryUseCaseFactory";

export const makeEditCategoryControllerFactory = () => {
  return new EditCategoryController(makeEditCategoryUseCaseFactory());
};
