import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteRoutinesUseCase } from "@/data/usecases/routines/deleteRoutinesUseCase";

export class DeleteRoutinesController implements Controller {
  constructor(private readonly deleteRoutinesService: DeleteRoutinesUseCase) {
    this.deleteRoutinesService = deleteRoutinesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      await this.deleteRoutinesService.handle({
        routineId: String(id),
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        message: "Rotina excluída com sucesso",
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
