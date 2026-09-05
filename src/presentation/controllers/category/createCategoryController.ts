import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateCategoryUseCase } from "@/data/usecases/category/createCategoryUseCase";

export class CreateCategoryController implements Controller {
  constructor(private readonly createCategoryService: CreateCategoryUseCase) {
    this.createCategoryService = createCategoryService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { name, description, type, recordTypeId } = req.body;

      const data = {
        name,
        description,
        type,
        recordTypeId,
      };

      const createCategory = await this.createCategoryService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createCategory,
        message: "Categoria criada com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
