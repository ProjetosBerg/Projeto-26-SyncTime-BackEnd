import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByRecordTypeIdCustomFieldUseCase } from "@/data/usecases/customFields/getByRecordTypeIdCustomFieldUseCase";

export class GetByRecordTypeIdCustomFieldsController implements Controller {
  constructor(
    private readonly getByRecordTypeIdCustomFieldsService: GetByRecordTypeIdCustomFieldUseCase
  ) {
    this.getByRecordTypeIdCustomFieldsService =
      getByRecordTypeIdCustomFieldsService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { categoryId, recordTypeId } = req.query;
      const { customFields: result, total } =
        await this.getByRecordTypeIdCustomFieldsService.handle({
          userId: req.user!.id,
          categoryId: String(categoryId),
          recordTypeId: Number(recordTypeId),
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Campos customizados obtidos com sucesso",
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
