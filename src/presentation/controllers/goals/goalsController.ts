import { Request, Response } from "express";
import { GoalService } from "@/data/usecases/goals/goalService";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { ResponseStatus } from "@/utils/service";

export class GoalsController {
  constructor(private readonly service: GoalService) {}

  async list(req: Request, res: Response) {
    try {
      const data = await this.service.list(req.user!.id);
      return res.status(200).json({ status: ResponseStatus.OK, data });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = await this.service.create(req.user!.id, req.body);
      return res.status(201).json({ status: ResponseStatus.OK, data, message: "Meta criada com sucesso" });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await this.service.update(req.params.id, req.user!.id, req.body);
      return res.status(200).json({ status: ResponseStatus.OK, data, message: "Meta atualizada com sucesso" });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id, req.user!.id);
      return res.status(200).json({ status: ResponseStatus.OK, message: "Meta excluída com sucesso" });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
