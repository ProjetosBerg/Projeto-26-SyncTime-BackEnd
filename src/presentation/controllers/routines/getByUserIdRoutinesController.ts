import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
