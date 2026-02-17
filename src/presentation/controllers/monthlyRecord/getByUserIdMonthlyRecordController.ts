import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/getByUserIdMonthlyRecordUseCase";
import { FilterParam } from "../interfaces/FilterParam";

export class GetByUserIdMonthlyRecordController implements Controller {
  constructor(
    private readonly getByUserIdMonthlyRecordService: GetByUserIdMonthlyRecordUseCase
  ) {
    this.getByUserIdMonthlyRecordService = getByUserIdMonthlyRecordService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "",
        order,
        categoryId,
      } = req.query;
      let filters: FilterParam[] = [];

      if (req.query.filters) {
        try {
          filters = JSON.parse(req.query.filters as string);
        } catch (e) {
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message: "Formato de filtros inválido. Esperado um JSON válido.",
          });
        }
      }
      const { records: result, total } =
        await this.getByUserIdMonthlyRecordService.handle({
          categoryId: String(categoryId),
          userId: req.user!.id,
          page: Number(page),
          limit: Number(limit),
          sortBy: sortBy as any,
          order: String(order),
          filters,
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Registros obtidos com sucesso",
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
