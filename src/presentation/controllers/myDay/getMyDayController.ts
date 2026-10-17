import { Request, Response } from "express";
import { GetMyDayUseCase } from "@/data/usecases/myDay/getMyDayUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { Controller } from "@/presentation/protocols/controller";
import { IResponse, ResponseStatus } from "@/utils/service";

export class GetMyDayController implements Controller {
  constructor(private readonly getMyDayService: GetMyDayUseCase) {}

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const result = await this.getMyDayService.handle({
        userId: req.user!.id,
        date: String(req.query.date || ""),
      });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Meu Dia obtido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
