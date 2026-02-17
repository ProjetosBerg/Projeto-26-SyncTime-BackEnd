import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";

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
