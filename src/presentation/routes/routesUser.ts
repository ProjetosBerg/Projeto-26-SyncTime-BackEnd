import { Router, Request, Response } from "express";
import { makeEditUserByIdControllerFactory } from "@/main/factories/controllers/user/editUserControllerFactory";
import { makeFindQuestionsUserControllerFactory } from "@/main/factories/controllers/user/findQuestionsUserControllerFactory";
import { makeFindUserByIdControllerFactory } from "@/main/factories/controllers/user/findUserControllerFactory";
import { makeForgotPasswordUserControllerFactory } from "@/main/factories/controllers/user/forgotPasswordUserControllerFactory";
import { makeLoginUserControllerFactory } from "@/main/factories/controllers/user/loginUserControllerFactory";
import { makeRegisterUserControllerFactory } from "@/main/factories/controllers/user/registerUserControllerFactory";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";
import { makeDeleteUserByIdControllerFactory } from "@/main/factories/controllers/user/deleteUserControllerFactory";
import { makeResetPasswordUserControllerFactory } from "@/main/factories/controllers/user/resetPasswordUserControllerFactory";
import { makeLogoutUserControllerFactory } from "@/main/factories/controllers/user/logoutUserControllerFactory";
import { makeGetPresenceUserControllerFactory } from "@/main/factories/controllers/user/getPresenceUserControllerFactory";
import { makeGetStreakUserControllerFactory } from "@/main/factories/controllers/user/getStreakUserControllerFactory";
import { makeUploadUserMiddleware } from "../middlewares/uploadUserMiddleware";
import { makeGetInboxControllerFactory } from "@/main/factories/controllers/user/getInboxControllerFactory";
import { makeGetByUserIdRankControllerFactory } from "@/main/factories/controllers/user/getByUserIdRankControllerFactory";
import { makeRateLimitMiddleware } from "../middlewares/rateLimit";

const normalizeLogin = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "unknown";

const loginRateLimit = makeRateLimitMiddleware({
  limit: 10,
  windowMs: 15 * 60 * 1000,
  keyPrefix: "login",
  key: (req) => `${req.ip}:${normalizeLogin(req.body?.login)}`,
});

const registerRateLimit = makeRateLimitMiddleware({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  keyPrefix: "register",
});

const recoveryRateLimit = makeRateLimitMiddleware({
  limit: 5,
  windowMs: 15 * 60 * 1000,
  keyPrefix: "password-recovery",
  key: (req) =>
    `${req.ip}:${normalizeLogin(req.body?.login || req.query?.login)}`,
});

const passwordChangeRateLimit = makeRateLimitMiddleware({
  limit: 5,
  windowMs: 15 * 60 * 1000,
  keyPrefix: "password-change",
  key: (req) => String(req.user?.id || req.ip),
});

export const routesUser = (router: Router) => {
  router.get(
    "/user/find-questions",
    adapterMiddleware(recoveryRateLimit),
    (req: Request, res: Response) => {
      makeFindQuestionsUserControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/user/get-presence",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetPresenceUserControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/user/get-streak",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetStreakUserControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/user/rank",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetByUserIdRankControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/user/find-user/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeFindUserByIdControllerFactory().handle(req, res);
    }
  );

  router.get(
    "/user/inbox",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeGetInboxControllerFactory().handle(req, res);
    }
  );

  router.post(
    "/user/register",
    adapterMiddleware(registerRateLimit),
    adapterMiddleware(makeUploadUserMiddleware()),
    (req: Request, res: Response) => {
      makeRegisterUserControllerFactory().handle(req, res);
    }
  );

  router.post(
    "/user/login",
    adapterMiddleware(loginRateLimit),
    (req: Request, res: Response) => {
      makeLoginUserControllerFactory().handle(req, res);
    }
  );

  router.post(
    "/user/logout",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeLogoutUserControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/user/forgot-password",
    adapterMiddleware(recoveryRateLimit),
    (req: Request, res: Response) => {
      makeForgotPasswordUserControllerFactory().handle(req, res);
    }
  );
  router.patch(
    "/user/reset-password",
    adapterMiddleware(makeGetLoginMiddleware()),
    adapterMiddleware(passwordChangeRateLimit),
    (req: Request, res: Response) => {
      makeResetPasswordUserControllerFactory().handle(req, res);
    }
  );

  router.patch(
    "/user/edit/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    adapterMiddleware(makeUploadUserMiddleware()),
    (req: Request, res: Response) => {
      makeEditUserByIdControllerFactory().handle(req, res);
    }
  );

  router.delete(
    "/user/delete/:id",
    adapterMiddleware(makeGetLoginMiddleware()),
    (req: Request, res: Response) => {
      makeDeleteUserByIdControllerFactory().handle(req, res);
    }
  );
};
