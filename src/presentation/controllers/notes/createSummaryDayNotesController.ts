import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateSummaryDayNotesUseCase } from "@/data/usecases/notes/createSummaryDayNotesUseCase";

export class CreateSummaryDayNotesController implements Controller {
  constructor(
    private readonly createSummaryDayNotesService: CreateSummaryDayNotesUseCase
  ) {
    this.createSummaryDayNotesService = createSummaryDayNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { date, routine_id } = req.body;

      const data = {
        date,
        routine_id,
      };

      const summary = await this.createSummaryDayNotesService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: summary,
        message: "Resumo do dia criado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
