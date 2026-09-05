import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdNotificationUseCase } from "@/data/usecases/notification/getByUserIdNotificationUseCase";

export class GetByUserIdNotificationController implements Controller {
  constructor(
    private readonly getByUserIdNotificationService: GetByUserIdNotificationUseCase
  ) {
    this.getByUserIdNotificationService = getByUserIdNotificationService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "",
        order,
        isRead,
        typeOfAction,
        isListAll = false,
      } = req.query;

      const { notifications: result, total } =
        await this.getByUserIdNotificationService.handle({
          userId: req.user!.id,
          page: isListAll ? 1 : Number(page),
          limit: isListAll ? 1000000000000 : Number(limit),
          search: String(search),
          sortBy: sortBy as any,
          order: String(order || "ASC"),
          isRead: isRead !== undefined ? Boolean(isRead) : undefined,
          typeOfAction: String(typeOfAction || ""),
        });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Notificações obtidas com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
