import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import { setRefreshTokenCookie } from "@/presentation/helpers/refreshTokenCookie";

export class LoginUserController implements Controller {
  constructor(private readonly loginUserService: LoginUserUseCase) {
    this.loginUserService = loginUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { login, password } = req.body;
      const data = {
        login,
        password,
      };
      const result = await this.loginUserService.handle({ ...data });
      const { refreshToken, ...publicResult } = result;
      if (refreshToken) {
        setRefreshTokenCookie(res, refreshToken);
      }
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: publicResult,
        message: "Usuário logado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
