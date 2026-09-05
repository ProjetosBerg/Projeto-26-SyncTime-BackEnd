import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
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
      return handleControllerError(res, error);
    }
  }
}
