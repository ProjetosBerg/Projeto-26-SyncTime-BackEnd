import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdNotesUseCase } from "@/data/usecases/notes/getByUserIdNotesUseCase";

export class GetByUserIdNotesController implements Controller {
  constructor(
    private readonly getByUserIdNotesService: GetByUserIdNotesUseCase
  ) {
    this.getByUserIdNotesService = getByUserIdNotesService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "",
        order,
        isListAll = false,
      } = req.query;

      const { notes: result, total } =
        await this.getByUserIdNotesService.handle({
          userId: req.user!.id,
          page: isListAll ? 1 : Number(page),
          limit: isListAll ? 1000000000000 : Number(limit),
          search: String(search),
          sortBy: sortBy as any,
          order: String(order || "ASC"),
        });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        totalRegisters: total,
        message: "Anotações obtidas com sucesso",
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
