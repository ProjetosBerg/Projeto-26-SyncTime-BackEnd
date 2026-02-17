import { makeCreateCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/createCustomFieldsControllerFactory";
import { makeDeleteCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/deleteCustomFieldsControllerFactory";
import { makeEditCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/editCustomFieldsControllerFactory";
import { makeGetByIdCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/getByIdCustomFieldsControllerFactory";
import { makeGetByRecordTypeIdCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/getByRecordTypesIdCustomFieldsControllerFactory";
import { makeGetByUserIdCustomFieldsControllerFactory } from "@/main/factories/controllers/customFields/getByUserIdCustomFieldsControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";

export const routesCustomFields = (router: Router) => {
  router.get(
    "/custom-fields/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdCustomFieldsControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/custom-fields/get-by-record-type",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByRecordTypeIdCustomFieldsControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/custom-fields/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdCustomFieldsControllerFactory().handle(req, res);
    }
  );
  router.post(
    "/custom-fields/create",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateCustomFieldsControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/custom-fields/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeEditCustomFieldsControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/custom-fields/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteCustomFieldsControllerFactory().handle(req, res);
    }
  );
};
