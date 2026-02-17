import { makeGetDashboardCategoryControllerFactory } from "@/main/factories/controllers/dashboard/getDashboardCategoryControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";

export const routesDashboard = (router: Router) => {
  router.get(
    "/dashboard/category",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetDashboardCategoryControllerFactory().handle(req, res);
    }
  );
};
