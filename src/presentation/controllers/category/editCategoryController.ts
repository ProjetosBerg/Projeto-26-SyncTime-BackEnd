import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditCategoryUseCase } from "@/data/usecases/category/editCategoryUseCase";

export class EditCategoryController implements Controller {
  constructor(private readonly editeCategoryService: EditCategoryUseCase) {
    this.editeCategoryService = editeCategoryService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const { name, description, type, recordTypeId } = req.body;

      const data = {
        name,
        description,
        type,
        recordTypeId,
      };

      const result = await this.editeCategoryService.handle({
        ...data,
        categoryId: id,
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Categoria editada com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
