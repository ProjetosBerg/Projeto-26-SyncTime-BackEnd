// src/presentation/controllers/users/GetPresenceUserController.ts
import { Request, Response } from "express";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetPresenceUserUseCase } from "@/data/usecases/users/getPresenceUserUseCase";

export class GetPresenceUserController implements Controller {
  constructor(private readonly getPresenceUserService: GetPresenceUserUseCase) {
    this.getPresenceUserService = getPresenceUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id: userId } = req.user || {};
      const { month, year } = req.query;

      if (!userId) {
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Token inválido ou ausente",
        });
      }

      if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          message: "Mês e ano são obrigatórios e devem ser números válidos",
        });
      }

      const result = await this.getPresenceUserService.handle({
        userId: String(userId),
        month: Number(month),
        year: Number(year),
      });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Dados de presença obtidos com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
