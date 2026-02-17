import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
