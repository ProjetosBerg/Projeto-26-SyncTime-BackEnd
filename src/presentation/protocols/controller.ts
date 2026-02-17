import { Request, Response, NextFunction } from "express";

import { IResponse } from "@/utils/service";

export interface Controller {
  handle(
    req: Request,
    res: Response,
    next?: NextFunction
  ): Promise<Response<IResponse> | undefined>;
}
