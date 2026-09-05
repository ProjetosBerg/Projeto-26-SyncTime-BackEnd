import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/deleteMonthlyRecordyUseCase";
import { DeleteTransactionUseCase } from "@/data/usecases/transactions/deleteTransactionUseCase";

export class DeleteTransactionController implements Controller {
  constructor(
    private readonly deleteTransactionService: DeleteTransactionUseCase
  ) {
    this.deleteTransactionService = deleteTransactionService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.deleteTransactionService.handle({
        transactionId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Registro excluida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
