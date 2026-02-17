import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { CreateNotesUseCase } from "@/data/usecases/notes/createNotesUseCase";

export class CreateNotesController implements Controller {
  constructor(private readonly createNotesService: CreateNotesUseCase) {
    this.createNotesService = createNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
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
        dateOfNote,
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
        dateOfNote,
      };

      const createNote = await this.createNotesService.handle({
        ...data,
        userId: req.user!.id,
      });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createNote,
        message: "Anotação criada com sucesso",
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
