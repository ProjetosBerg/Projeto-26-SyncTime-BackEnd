import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByIdCategoryUseCase } from "@/data/usecases/category/getByIdCategoryUseCase";
import { Category } from "./../../../domain/entities/postgres/Category";

export class GetByIdCategoryController implements Controller {
  constructor(private readonly getByIdCategoryService: GetByIdCategoryUseCase) {
    this.getByIdCategoryService = getByIdCategoryService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.getByIdCategoryService.handle({
        categoryId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Categoria obtida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
