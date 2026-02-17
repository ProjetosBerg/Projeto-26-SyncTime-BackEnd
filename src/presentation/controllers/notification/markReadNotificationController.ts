import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { MarkReadNotificationUseCase } from "@/data/usecases/notification/markReadNotificationUseCase";

export class MarkReadNotificationController implements Controller {
  constructor(
    private readonly markReadNotificationService: MarkReadNotificationUseCase
  ) {
    this.markReadNotificationService = markReadNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { ids } = req.body;

      await this.markReadNotificationService.handle({
        userId: req.user!.id,
        ids,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        message: "Notificação(ões) marcada(s) como lida(s) com sucesso",
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
