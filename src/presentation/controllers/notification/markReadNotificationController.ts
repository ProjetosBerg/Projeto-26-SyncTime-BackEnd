import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
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
      return handleControllerError(res, error);
    }
  }
}
