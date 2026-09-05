import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateRecordTypeUseCase } from "@/data/usecases/recordTypes/createRecordTypesUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import { GetByUserIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByUserIdRecordTypesUseCase";

export class GetByUserIdRecordTypesController implements Controller {
  constructor(
    private readonly getByUserIdRecordTypesService: GetByUserIdRecordTypeUseCase
  ) {
    this.getByUserIdRecordTypesService = getByUserIdRecordTypesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "",
        order,
      } = req.query;
      const { recordTypes: result, total } =
        await this.getByUserIdRecordTypesService.handle({
          userId: req.user!.id,
          page: Number(page),
          limit: Number(limit),
          search: String(search),
          sortBy: sortBy as any,
          order: String(order),
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Tipos de registros obtidos com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
