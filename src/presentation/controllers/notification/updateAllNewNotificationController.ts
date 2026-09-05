import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
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
      return handleControllerError(res, error);
    }
  }
}
