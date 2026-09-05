import { Request, Response } from "express";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetByUserIdRankUserUseCase } from "@/data/usecases/users/getByUserIdRankUserUseCase";

export class GetByUserIdRankUserController implements Controller {
  constructor(
    private readonly getByUserIdRankUserService: GetByUserIdRankUserUseCase
  ) {
    this.getByUserIdRankUserService = getByUserIdRankUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const {
        year = new Date().getFullYear(),
        month = new Date().getMonth() + 1,
      } = req.query;

      const { top10, myRank } = await this.getByUserIdRankUserService.handle({
        userId: req.user!.id,
        year: Number(year),
        month: Number(month),
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: { top10, myRank },
        message: "Rank obtido com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
