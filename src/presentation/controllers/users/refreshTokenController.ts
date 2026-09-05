import { Request, Response } from "express";
import { RefreshTokenUseCase } from "@/data/usecases/users/refreshTokenUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/presentation/helpers/refreshTokenCookie";
import { Controller } from "@/presentation/protocols/controller";
import { IResponse, ResponseStatus } from "@/utils/service";

export class RefreshTokenController implements Controller {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      if (req.get("X-Requested-With") !== "XMLHttpRequest") {
        clearRefreshTokenCookie(res);
        return res.status(403).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Requisição de renovação não autorizada",
        });
      }

      const refreshToken = getRefreshTokenCookie(req);
      if (!refreshToken) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Sessão expirada. Faça login novamente.",
        });
      }

      const result = await this.refreshTokenUseCase.handle({ refreshToken });
      setRefreshTokenCookie(res, result.refreshToken);
      res.setHeader("Cache-Control", "no-store");

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: {
          token: result.token,
          user: result.user,
        },
        message: "Token renovado com sucesso",
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      return handleControllerError(res, error);
    }
  }
}
