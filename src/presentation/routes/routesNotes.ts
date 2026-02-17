import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";
import { makeCreateNotesControllerFactory } from "@/main/factories/controllers/notes/createNotesControllerFactory";
import { makeEditNotesControllerFactory } from "@/main/factories/controllers/notes/editNotesControllerFactory";
import { makeGetByUserIdNotesControllerFactory } from "@/main/factories/controllers/notes/getByUserIdNotesControllerFactory";
import { makeGetByIdNotesControllerFactory } from "@/main/factories/controllers/notes/getByIdNotesControllerFactory";
import { makeDeleteNotesControllerFactory } from "@/main/factories/controllers/notes/deleteNotesControllerFactory";
import { makeCreateSummaryDayNotesControllerFactory } from "@/main/factories/controllers/notes/createSummaryDayNotesControllerFactory";

export const routesNotes = (router: Router) => {
  router.get(
    "/notes/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdNotesControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/notes/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdNotesControllerFactory().handle(req, res);
    }
  );
  router.post(
    "/notes/create",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateNotesControllerFactory().handle(req, res);
    }
  );

  router.post(
    "/notes/create/summary-day",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeCreateSummaryDayNotesControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/notes/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeEditNotesControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/notes/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteNotesControllerFactory().handle(req, res);
    }
  );
};
