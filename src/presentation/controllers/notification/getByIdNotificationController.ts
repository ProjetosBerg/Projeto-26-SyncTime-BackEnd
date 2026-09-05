import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { GetByIdNotificationUseCase } from "@/data/usecases/notification/getByIdNotificationUseCase";

export class GetByIdNotificationController implements Controller {
  constructor(
    private readonly getByIdNotificationService: GetByIdNotificationUseCase
  ) {
    this.getByIdNotificationService = getByIdNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;

      const result = await this.getByIdNotificationService.handle({
        userId: req.user!.id,
        id: String(id),
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Notificação obtida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
