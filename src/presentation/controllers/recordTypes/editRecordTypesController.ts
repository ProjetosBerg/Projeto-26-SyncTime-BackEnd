import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditRecordTypeUseCase } from "@/data/usecases/recordTypes/editRecordTypeUseCase";

export class EditRecordTypesController implements Controller {
  constructor(private readonly editRecordTypesService: EditRecordTypeUseCase) {
    this.editRecordTypesService = editRecordTypesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const { name, icone } = req.body;

      const data = {
        name,
        icone,
      };

      const result = await this.editRecordTypesService.handle({
        ...data,
        recordTypeId: Number(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Tipo de registro editado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
