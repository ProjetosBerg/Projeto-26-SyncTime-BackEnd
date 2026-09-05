import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/createMonthlyRecordUseCase";

export class CreateMonthlyRecordController implements Controller {
  constructor(
    private readonly createMonthlyRecordService: CreateMonthlyRecordUseCase
  ) {
    this.createMonthlyRecordService = createMonthlyRecordService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        title,
        description,
        goal,
        initial_balance,
        month,
        year,
        categoryId,
        status,
      } = req.body;

      const data = {
        title,
        description,
        goal,
        initial_balance,
        month,
        year,
        categoryId,
        status,
      };

      const createMonthlyRecord = await this.createMonthlyRecordService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createMonthlyRecord,
        message: "Registro mensal criado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
