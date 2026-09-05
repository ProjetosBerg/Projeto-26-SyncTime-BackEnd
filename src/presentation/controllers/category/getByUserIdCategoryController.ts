import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdCategoryUseCase } from "@/data/usecases/category/getByUserIdCategoryUseCase";

export class GetByUserIdCategoryController implements Controller {
  constructor(
    private readonly getByUserIdCategoryService: GetByUserIdCategoryUseCase
  ) {
    this.getByUserIdCategoryService = getByUserIdCategoryService;
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
        isSideBar = false,
      } = req.query;

      const { categories: result, total } =
        await this.getByUserIdCategoryService.handle({
          userId: req.user!.id,
          page: isSideBar ? 1 : Number(page),
          limit: isSideBar ? 1000000000000 : Number(limit),
          search: String(search),
          sortBy: sortBy as any,
          order: String(order),
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Categorias obtidas com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
