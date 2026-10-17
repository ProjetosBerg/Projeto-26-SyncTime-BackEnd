import { makeGetMyDayControllerFactory } from "@/main/factories/controllers/myDay/getMyDayControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Request, Response, Router } from "express";

export const routesMyDay = (router: Router) => {
  router.get(
    "/my-day",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetMyDayControllerFactory().handle(req, res);
    }
  );
};
