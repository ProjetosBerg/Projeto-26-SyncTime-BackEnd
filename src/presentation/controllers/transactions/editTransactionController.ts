import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditTransactionUseCase } from "@/data/usecases/transactions/editTransactionUseCase";

export class EditTransactionController implements Controller {
  constructor(private readonly editTransactionService: EditTransactionUseCase) {
    this.editTransactionService = editTransactionService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
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

      const result = await this.editTransactionService.handle({
        ...data,
        transactionId: id,
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Registro mensal editado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
