import { makeCreateCategoryControllerFactory } from "@/main/factories/controllers/category/createCategoryControllerFactory";
import { makeGetByUserIdCategoryControllerFactory } from "@/main/factories/controllers/category/getByUserIdCategoryControllerFactory";
import { makeGetByIdCategoryControllerFactory } from "@/main/factories/controllers/category/getByIdCategoryControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";
import { makeDeleteCategoryControllerFactory } from "@/main/factories/controllers/category/deleteCategoryControllerFactory";
import { makeEditCategoryControllerFactory } from "@/main/factories/controllers/category/editCategoryControllerFactory";

export const routesCategory = (router: Router) => {
  router.get(
    "/category/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdCategoryControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/category/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdCategoryControllerFactory().handle(req, res);
    }
  );
  router.post(
    "/category/create",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateCategoryControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/category/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeEditCategoryControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/category/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteCategoryControllerFactory().handle(req, res);
    }
  );
};
