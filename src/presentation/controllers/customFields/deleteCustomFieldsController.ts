import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteCustomFieldUseCase } from "@/data/usecases/customFields/deleteCustomFieldUseCase";

export class DeleteCustomFieldsController implements Controller {
  constructor(
    private readonly deleteCustomFieldsService: DeleteCustomFieldUseCase
  ) {
    this.deleteCustomFieldsService = deleteCustomFieldsService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.deleteCustomFieldsService.handle({
        customFieldsId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Campo personalizado excluido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
