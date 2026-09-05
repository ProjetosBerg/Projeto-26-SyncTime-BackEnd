import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByIdTransactionUseCase } from "@/data/usecases/transactions/getByIdTransactionUseCase";

export class GetByIdTransactionController implements Controller {
  constructor(
    private readonly getByIdTransactionService: GetByIdTransactionUseCase
  ) {
    this.getByIdTransactionService = getByIdTransactionService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.getByIdTransactionService.handle({
        transactionId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Registro obtido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
