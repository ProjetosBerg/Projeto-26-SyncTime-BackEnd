import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
