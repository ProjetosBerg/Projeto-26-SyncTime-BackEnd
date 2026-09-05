import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateTransactionUseCase } from "@/data/usecases/transactions/createTransactionUseCase";

export class CreateTransactionController implements Controller {
  constructor(
    private readonly createTransactionService: CreateTransactionUseCase
  ) {
    this.createTransactionService = createTransactionService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        title,
        description,
        amount,
        transactionDate,
        monthlyRecordId,
        categoryId,
        customFields,
      } = req.body;

      const data = {
        title,
        description,
        amount,
        transactionDate,
        monthlyRecordId,
        categoryId,
        customFields,
      };

      const createTransaction = await this.createTransactionService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createTransaction,
        message: "Registro ao relatorio mensal criado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
