import { GetByUserIdCategoryController } from "@/presentation/controllers/category/getByUserIdCategoryController";
import { makeGetByUserIdCategoryUseCaseFactory } from "../../usecase/category/getByUserIdCategoryUseCaseFactory";

export const makeGetByUserIdCategoryControllerFactory = () => {
  return new GetByUserIdCategoryController(
    makeGetByUserIdCategoryUseCaseFactory()
  );
};
