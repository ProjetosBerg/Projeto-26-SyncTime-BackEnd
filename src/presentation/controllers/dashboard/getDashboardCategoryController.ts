import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetDashboardCategoryUseCase } from "@/data/usecases/dashboard/getDashboardCategoryUseCase";

export class GetDashboardCategoryController implements Controller {
  constructor(
    private readonly getDashboardCategoryService: GetDashboardCategoryUseCase
  ) {}

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { categoryId, startDate, endDate, groupBy = "month" } = req.query;

      const result = await this.getDashboardCategoryService.handle({
        userId: req.user!.id,
        categoryId: categoryId ? String(categoryId) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        groupBy: groupBy as "day" | "week" | "month" | "year",
      });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Dashboard obtido com sucesso",
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
