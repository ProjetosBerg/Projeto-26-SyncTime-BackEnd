import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

export class ForgotPasswordController implements Controller {
  constructor(
    private readonly forgotPasswordUserService: ForgotPasswordUserUseCase
  ) {
    this.forgotPasswordUserService = forgotPasswordUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { login, newPassword, confirmNewPassword, securityQuestions } =
        req.body;
      const data = {
        login,
        newPassword,
        confirmNewPassword,
        securityQuestions,
      };
      const result = await this.forgotPasswordUserService.handle({ ...data });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Senha alterada com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
