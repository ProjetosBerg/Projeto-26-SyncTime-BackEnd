// src/presentation/controllers/users/GetStreakUserController.ts
import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetStreakUserUseCase } from "@/data/usecases/users/getStreakUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

export class GetStreakUserController implements Controller {
  constructor(private readonly getStreakUserService: GetStreakUserUseCase) {
    this.getStreakUserService = getStreakUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id: userId } = req.user || {};

      if (!userId) {
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Token inválido ou ausente",
        });
      }

      const result = await this.getStreakUserService.handle({
        userId: String(userId),
      });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Dados de streak obtidos com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
