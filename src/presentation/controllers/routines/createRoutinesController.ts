import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateRoutinesUseCase } from "@/data/usecases/routines/createRoutinesUseCase";

export class CreateRoutinesController implements Controller {
  constructor(private readonly createRoutinesService: CreateRoutinesUseCase) {
    this.createRoutinesService = createRoutinesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { type, period, periods, createdAt } = req.body;

      const data = {
        type,
        period,
        periods,
        createdAt,
      };

      const createRoutine = await this.createRoutinesService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createRoutine,
        message: Array.isArray(createRoutine)
          ? "Rotinas criadas com sucesso"
          : "Rotina criada com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
