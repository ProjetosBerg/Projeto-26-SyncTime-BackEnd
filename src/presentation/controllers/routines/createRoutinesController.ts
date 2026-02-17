import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
      const { type, period, createdAt } = req.body;

      const data = {
        type,
        period,
        createdAt,
      };

      const createRoutine = await this.createRoutinesService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createRoutine,
        message: "Rotina criada com sucesso",
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
