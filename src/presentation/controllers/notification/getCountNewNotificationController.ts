import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetCountNewNotificationUseCase } from "@/data/usecases/notification/getCountNewNotificationUseCase";

export class GetCountNewNotificationController implements Controller {
  constructor(
    private readonly getCountNewNotificationService: GetCountNewNotificationUseCase
  ) {
    this.getCountNewNotificationService = getCountNewNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const count = await this.getCountNewNotificationService.handle({
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: count,
        message: "Contagem de notificações novas obtida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
