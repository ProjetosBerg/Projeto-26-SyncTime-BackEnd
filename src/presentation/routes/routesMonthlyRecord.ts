import { makeCreateMonthlyRecordControllerFactory } from "@/main/factories/controllers/monthlyRecord/createMonthlyRecordControllerFactory";
import { makeDeleteMonthlyRecordControllerFactory } from "@/main/factories/controllers/monthlyRecord/deleteMonthlyRecordControllerFactory";
import { makeEditMonthlyRecordControllerFactory } from "@/main/factories/controllers/monthlyRecord/editMonthlyRecordControllerFactory";
import { makeGetByIdMonthlyRecordControllerFactory } from "@/main/factories/controllers/monthlyRecord/getByIdMonthlyRecordControllerFactory";
import { makeGetByUserIdMonthlyRecordControllerFactory } from "@/main/factories/controllers/monthlyRecord/getByUserIdMonthlyRecordControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";

export const routesMonthlyRecord = (router: Router) => {
  router.get(
    "/monthly-record/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdMonthlyRecordControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/monthly-record/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdMonthlyRecordControllerFactory().handle(req, res);
    }
  );
  router.post(
    "/monthly-record/create",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateMonthlyRecordControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/monthly-record/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeEditMonthlyRecordControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/monthly-record/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteMonthlyRecordControllerFactory().handle(req, res);
    }
  );
};
