import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByIdCustomFieldUseCase } from "@/data/usecases/customFields/getByIdCustomFieldUseCase";

export class GetByIdCustomFieldsController implements Controller {
  constructor(
    private readonly getByIdCustomFieldsService: GetByIdCustomFieldUseCase
  ) {
    this.getByIdCustomFieldsService = getByIdCustomFieldsService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.getByIdCustomFieldsService.handle({
        customFieldsId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Campo personalizado obtido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
