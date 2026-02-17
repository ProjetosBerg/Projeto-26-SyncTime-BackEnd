import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditNotesUseCase } from "@/data/usecases/notes/editNotesUseCase";

export class EditNotesController implements Controller {
  constructor(private readonly editNotesService: EditNotesUseCase) {
    this.editNotesService = editNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const {
        status,
        collaborators,
        priority,
        category_id,
        activity,
        activityType,
        description,
        startTime,
        endTime,
        comments,
        routine_id,
      } = req.body;

      const data = {
        status,
        collaborators,
        priority,
        category_id,
        activity,
        activityType,
        description,
        startTime,
        endTime,
        comments,
        routine_id,
      };

      const result = await this.editNotesService.handle({
        ...data,
        noteId: id,
        userId: req.user!.id,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Anotação editada com sucesso",
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
