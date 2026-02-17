import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UpdateAllNewNotificationUseCase } from "@/data/usecases/notification/updateAllNewNotificationUseCase";

export class UpdateAllNewNotificationController implements Controller {
  constructor(
    private readonly updateAllNewNotificationService: UpdateAllNewNotificationUseCase
  ) {
    this.updateAllNewNotificationService = updateAllNewNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      await this.updateAllNewNotificationService.handle({
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        message:
          "Todas as notificações novas foram marcadas como vistas com sucesso",
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          errors: error.errors,
        });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: ResponseStatus.NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
