import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByIdRecordTypesUseCase";

export class GetByIdRecordTypesController implements Controller {
  constructor(
    private readonly getByIdRecordTypesService: GetByIdRecordTypeUseCase
  ) {
    this.getByIdRecordTypesService = getByIdRecordTypesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.getByIdRecordTypesService.handle({
        recordTypeId: Number(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Tipo de registro obtido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
