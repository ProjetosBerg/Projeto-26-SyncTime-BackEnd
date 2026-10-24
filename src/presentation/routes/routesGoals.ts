import { Request, Response, Router } from "express";
import { GoalService } from "@/data/usecases/goals/goalService";
import { GoalRepository } from "@/infra/db/postgres/goalRepository";
import { GoalsController } from "@/presentation/controllers/goals/goalsController";
import { makeGetLoginMiddleware } from "@/main/factories/middleware/getLogin";
import { adapterMiddleware } from "@/utils/adapterMiddleware";

const controller = () => new GoalsController(new GoalService(new GoalRepository()));

export const routesGoals = (router: Router) => {
  const auth = adapterMiddleware(makeGetLoginMiddleware());
  router.get("/goals", auth, (req: Request, res: Response) => {
    void controller().list(req, res);
  });
  router.post("/goals", auth, (req: Request, res: Response) => {
    void controller().create(req, res);
  });
  router.patch("/goals/:id", auth, (req: Request, res: Response) => {
    void controller().update(req, res);
  });
  router.delete("/goals/:id", auth, (req: Request, res: Response) => {
    void controller().delete(req, res);
  });
};
