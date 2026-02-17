import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdTransactionUseCase } from "@/data/usecases/transactions/getByUserIdTransactionUseCase";
import { FilterParam } from "../interfaces/FilterParam";

export class GetByUserIdTransactionController implements Controller {
  constructor(
    private readonly getByUserIdTransactionService: GetByUserIdTransactionUseCase
  ) {
    this.getByUserIdTransactionService = getByUserIdTransactionService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { monthlyRecordId, sortBy = "", order } = req.query;
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
      const result = await this.getByUserIdTransactionService.handle({
        monthlyRecordId: String(monthlyRecordId),
        userId: req.user!.id,
        sortBy: sortBy as any,
        order: String(order),
        filters,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
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
