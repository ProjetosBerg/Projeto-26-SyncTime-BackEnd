import { GetDashboardCategoryController } from "@/presentation/controllers/dashboard/getDashboardCategoryController";
import { makeGetDashboardCategoryUseCaseFactory } from "../../usecase/dashboard/getDashboardCategoryUseCaseFactory";

export const makeGetDashboardCategoryControllerFactory = () => {
  return new GetDashboardCategoryController(
    makeGetDashboardCategoryUseCaseFactory()
  );
};
