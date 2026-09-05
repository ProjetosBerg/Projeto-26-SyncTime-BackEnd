import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByIdNotesUseCase } from "@/data/usecases/notes/getByIdNotesUseCase";

export class GetByIdNotesController implements Controller {
  constructor(private readonly getByIdNotesService: GetByIdNotesUseCase) {
    this.getByIdNotesService = getByIdNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const result = await this.getByIdNotesService.handle({
        noteId: String(id),
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Anotação obtida com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
