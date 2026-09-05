import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdCustomFieldUseCase } from "@/data/usecases/customFields/getByUserIdCustomFieldUseCase";

export class GetByUserIdCustomFieldsController implements Controller {
  constructor(
    private readonly getByUserIdCustomFieldsService: GetByUserIdCustomFieldUseCase
  ) {
    this.getByUserIdCustomFieldsService = getByUserIdCustomFieldsService;
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
      } = req.query;
      const { customFields: result, total } =
        await this.getByUserIdCustomFieldsService.handle({
          userId: req.user!.id,
          page: Number(page),
          limit: Number(limit),
          search: String(search),
          sortBy: sortBy as any,
          order: String(order),
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Campos customizados obtidos com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
