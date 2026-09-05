import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteCategoryUseCase } from "@/data/usecases/category/deleteCategoryUseCase";

export class DeleteCategoryController implements Controller {
  constructor(private readonly deleteCategoryService: DeleteCategoryUseCase) {
    this.deleteCategoryService = deleteCategoryService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.deleteCategoryService.handle({
        categoryId: String(id),
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Category excluida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
