import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
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
