import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateRecordTypeUseCase } from "@/data/usecases/recordTypes/createRecordTypesUseCase";

export class CreateRecordTypesController implements Controller {
  constructor(
    private readonly createRecordTypesService: CreateRecordTypeUseCase
  ) {
    this.createRecordTypesService = createRecordTypesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { name, icone } = req.body;

      const data = {
        name,
        icone,
      };

      const createRecordUser = await this.createRecordTypesService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createRecordUser,
        message: "Tipo de registro criado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
