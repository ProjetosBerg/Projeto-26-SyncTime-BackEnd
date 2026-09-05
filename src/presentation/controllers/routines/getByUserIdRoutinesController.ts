import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdRoutinesUseCase } from "@/data/usecases/routines/getByUserIdRoutinesUseCase";

export class GetByUserIdRoutinesController implements Controller {
  constructor(
    private readonly getByUserIdRoutinesService: GetByUserIdRoutinesUseCase
  ) {
    this.getByUserIdRoutinesService = getByUserIdRoutinesService;
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
        isCalendar = false,
        year,
        month,
      } = req.query;

      const limitValue = isCalendar ? 1000 : Number(limit);

      const { routines: result, total } =
        await this.getByUserIdRoutinesService.handle({
          userId: req.user!.id,
          page: isCalendar ? 1 : Number(page),
          limit: limitValue,
          search: String(search),
          sortBy: sortBy as any,
          order: String(order || "ASC") || "ASC",
          year: year ? Number(year) : undefined,
          month: month ? Number(month) : undefined,
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Rotinas obtidas com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
