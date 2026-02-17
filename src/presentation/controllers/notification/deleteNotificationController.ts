import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteNotificationUseCase } from "@/data/usecases/notification/deleteNotificationUseCase";

export class DeleteNotificationController implements Controller {
  constructor(
    private readonly deleteNotificationService: DeleteNotificationUseCase
  ) {
    this.deleteNotificationService = deleteNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { ids } = req.body;

      await this.deleteNotificationService.handle({
        userId: req.user!.id,
        ids,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        message: "Notificação(ões) excluída(s) com sucesso",
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
