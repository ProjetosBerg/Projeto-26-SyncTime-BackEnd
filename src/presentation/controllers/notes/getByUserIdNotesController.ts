import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
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
      return handleControllerError(res, error);
    }
  }
}
