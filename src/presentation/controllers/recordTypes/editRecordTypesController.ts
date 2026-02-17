import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
