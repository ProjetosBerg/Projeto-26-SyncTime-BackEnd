import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteNotesUseCase } from "@/data/usecases/notes/deleteNotesUseCase";

export class DeleteNotesController implements Controller {
  constructor(private readonly deleteNotesService: DeleteNotesUseCase) {
    this.deleteNotesService = deleteNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      await this.deleteNotesService.handle({
        noteId: String(id),
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        message: "Anotação excluída com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
