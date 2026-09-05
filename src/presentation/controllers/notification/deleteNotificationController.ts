import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
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
      return handleControllerError(res, error);
    }
  }
}
