import { Middleware } from "@/presentation/protocols/middleware";
import { Response, Request, NextFunction } from "express";

export const adapterMiddleware = (middleware: Middleware) => {
  return (req: Request, res: Response, next: NextFunction) =>
    middleware.handle(req, res, next);
};
