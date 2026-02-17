import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteRecordTypeUseCase } from "@/data/usecases/recordTypes/deleteRecordTypeUseCase";

export class DeleteRecordTypesController implements Controller {
  constructor(
    private readonly deleteRecordTypesService: DeleteRecordTypeUseCase
  ) {
    this.deleteRecordTypesService = deleteRecordTypesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;

      const result = await this.deleteRecordTypesService.handle({
        recordTypeId: Number(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Tipo de registro deletado com sucesso",
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
