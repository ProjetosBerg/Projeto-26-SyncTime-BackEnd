import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LogoutUserUseCase } from "@/data/usecases/users/logoutUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { clearRefreshTokenCookie } from "@/presentation/helpers/refreshTokenCookie";

export class LogoutUserController implements Controller {
  constructor(private readonly logoutUserService: LogoutUserUseCase) {
    this.logoutUserService = logoutUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const sessionId = req.user?.sessionId;

      if (!sessionId) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          message: "Session ID é obrigatório",
        });
      }

      const result = await this.logoutUserService.handle({ sessionId });
      clearRefreshTokenCookie(res);
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: result.message,
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      return handleControllerError(res, error);
    }
  }
}
