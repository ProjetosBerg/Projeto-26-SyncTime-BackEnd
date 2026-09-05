import { Request, Response, Router } from "express";
import { routesUser } from "./presentation/routes/routesUser";
import { routesRecordTypes } from "./presentation/routes/routesRecordTypes";
import { routesCategory } from "./presentation/routes/routesCategory";
import { routesMonthlyRecord } from "./presentation/routes/routesMonthlyRecord";
import { routesTransactions } from "./presentation/routes/routesTransactions";
import { routesCustomFields } from "./presentation/routes/routesCustomFields";
import { adapterMiddleware } from "./utils/adapterMiddleware";
import { routesRoutines } from "./presentation/routes/routesRoutines";
import { routesNotes } from "./presentation/routes/routesNotes";
import { makeValidateTokenControllerFactory } from "./main/factories/controllers/user/validateTokenControllerFactory";
import { makeGetLoginMiddleware } from "./main/factories/middleware/getLogin";
import { routesNotification } from "./presentation/routes/routerNotification";
import { routesDashboard } from "./presentation/routes/routerDashboard";
import { makeRefreshTokenControllerFactory } from "./main/factories/controllers/user/refreshTokenControllerFactory";
import { makeRateLimitMiddleware } from "./presentation/middlewares/rateLimit";

const router = Router();
const refreshRateLimit = makeRateLimitMiddleware({
  limit: 30,
  windowMs: 15 * 60 * 1000,
  keyPrefix: "refresh-token",
});

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "ok" });
});

router.post(
  "/auth/validate",
  adapterMiddleware(makeGetLoginMiddleware()),
  (req: Request, res: Response) => {
    makeValidateTokenControllerFactory().handle(req, res);
  }
);

router.post(
  "/auth/refresh",
  adapterMiddleware(refreshRateLimit),
  (req: Request, res: Response) => {
    makeRefreshTokenControllerFactory().handle(req, res);
  }
);

routesUser(router);
routesRecordTypes(router);
routesCategory(router);
routesMonthlyRecord(router);
routesTransactions(router);
routesCustomFields(router);
routesRoutines(router);
routesNotes(router);
routesNotification(router);
routesDashboard(router);
export default router;
