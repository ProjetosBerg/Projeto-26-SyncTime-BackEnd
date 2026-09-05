import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditCustomFieldUseCase } from "@/data/usecases/customFields/editCustomFieldUseCase";

export class EditCustomFieldsController implements Controller {
  constructor(
    private readonly editCustomFieldsService: EditCustomFieldUseCase
  ) {
    this.editCustomFieldsService = editCustomFieldsService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const {
        type,
        label,
        description,
        recordTypeId,
        required,
        options,
        categoryId,
      } = req.body;

      const name = label?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

      const data = {
        type,
        label,
        name,
        description,
        recordTypeId,
        required,
        options,
        categoryId,
      };

      const result = await this.editCustomFieldsService.handle({
        ...data,
        customFieldsId: id,
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Registro mensal editado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
