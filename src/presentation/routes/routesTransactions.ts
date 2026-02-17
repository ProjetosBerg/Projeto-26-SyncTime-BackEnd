import { makeCreateTransactionControllerFactory } from "@/main/factories/controllers/transactions/createTransactionControllerFactory";
import { makeDeleteTransactionControllerFactory } from "@/main/factories/controllers/transactions/deleteTransactionControllerFactory";
import { makeEditTransactionControllerFactory } from "@/main/factories/controllers/transactions/editTransactionControllerFactory";
import { makeExportTransactionControllerFactory } from "@/main/factories/controllers/transactions/exportTransactionControllerFactory";
import { makeGetByIdTransactionControllerFactory } from "@/main/factories/controllers/transactions/getByIdTransactionControllerFactory";
import { makeGetByUserIdTransactionControllerFactory } from "@/main/factories/controllers/transactions/getByUserIdTransactionControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";

export const routesTransactions = (router: Router) => {
  router.get(
    "/transactions/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdTransactionControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/transactions/export",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeExportTransactionControllerFactory().handle(req, res);
    }
  );
  router.get(
    "/transactions/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdTransactionControllerFactory().handle(req, res);
    }
  );
  router.post(
    "/transactions/create",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateTransactionControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/transactions/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeEditTransactionControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/transactions/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteTransactionControllerFactory().handle(req, res);
    }
  );
};
