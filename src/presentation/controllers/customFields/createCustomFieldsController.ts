import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateCustomFieldUseCase } from "@/data/usecases/customFields/createCustomFieldUseCase";

export class CreateCustomFieldsController implements Controller {
  constructor(
    private readonly createCustomFieldsService: CreateCustomFieldUseCase
  ) {
    this.createCustomFieldsService = createCustomFieldsService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        type,
        label,
        description,
        recordTypeId,
        required,
        options,
        categoryId,
      } = req.body;

      const name = label?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

      const data = {
        type,
        label,
        name,
        description,
        recordTypeId,
        required,
        options,
        categoryId,
      };

      const createTransaction = await this.createCustomFieldsService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createTransaction,
        message: "Custom Field criado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
