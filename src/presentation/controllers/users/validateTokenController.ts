// Atualizado: src/presentation/controllers/users/ValidateTokenController.ts
import { Request, Response } from "express";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { ValidateTokenUseCase } from "@/data/usecases/users/validateTokenUseCase";

export class ValidateTokenController implements Controller {
  constructor(private readonly validateTokenService: ValidateTokenUseCase) {
    this.validateTokenService = validateTokenService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id: userId } = req.user || {};
      const sessionId = req.user?.sessionId || req.body?.sessionId;

      if (!sessionId) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          message: "Session ID é obrigatório",
        });
      }

      if (!userId) {
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Token inválido ou ausente",
        });
      }

      const result = await this.validateTokenService.handle({
        userId: String(userId),
        sessionId: String(sessionId),
      });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: {
          valid: true,
          user: req.user,
          sessionId: result.sessionId,
        },
        message: "Token válido",
      });
    } catch (error) {
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
