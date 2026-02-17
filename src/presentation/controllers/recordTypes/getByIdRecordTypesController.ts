import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
