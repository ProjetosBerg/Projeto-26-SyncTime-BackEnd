import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
