import { CreateCategoryController } from "@/presentation/controllers/category/createCategoryController";
import { makeCreateCategoryUseCaseFactory } from "@/main/factories/usecase/category/createCategoryUseCaseFactory";

export const makeCreateCategoryControllerFactory = () => {
  return new CreateCategoryController(makeCreateCategoryUseCaseFactory());
};
