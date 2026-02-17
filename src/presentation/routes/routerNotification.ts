import { makeDeleteNotificationControllerFactory } from "@/main/factories/controllers/notification/deleteNotificationControllerFactory";
import { makeGetByIdNotificationControllerFactory } from "@/main/factories/controllers/notification/getByIdNotificationControllerFactory";
import { makeGetByUserIdNotificationControllerFactory } from "@/main/factories/controllers/notification/getByUserIdNotificationControllerFactory";
import { makeGetCountNewNotificationControllerFactory } from "@/main/factories/controllers/notification/getCountNewNotificationControllerFactory";
import { makeGetUpdateAllNewNotificationControllerFactory } from "@/main/factories/controllers/notification/getUpdateAllNewNotificationControllerFactory";
import { makeMarkReadNotificationControllerFactory } from "@/main/factories/controllers/notification/markReadNotificationControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { Router, Request, Response } from "express";

export const routesNotification = (router: Router) => {
  router.get(
    "/notification/userId",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdNotificationControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/notification/count/new-notification",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetCountNewNotificationControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/notification/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByIdNotificationControllerFactory().handle(req, res);
    }
  );

  router.post(
    "/notification/delete",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteNotificationControllerFactory().handle(req, res);
    }
  );
  router.patch(
    "/notification/mark-read",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeMarkReadNotificationControllerFactory().handle(req, res);
    }
  );
  router.put(
    "/notification/mark-read-new-notification-all",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetUpdateAllNewNotificationControllerFactory().handle(req, res);
    }
  );
};
