import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import { ResetPasswordUserUseCase } from "@/data/usecases/users/resetPasswordUserUseCase";

export class ResetPasswordController implements Controller {
  constructor(
    private readonly resetPasswordUserService: ResetPasswordUserUseCase
  ) {
    this.resetPasswordUserService = resetPasswordUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { login, newPassword, confirmNewPassword, id, oldPassword } =
        req.body;
      const data = {
        login,
        oldPassword,
        newPassword,
        confirmNewPassword,
      };

      if (!id) {
        return res.status(400).json({
          status: ResponseStatus.NOT_FOUND,
          message: "Id é obrigatorio",
        });
      }

      const isAuthorized = await checkUserAuthorization(req, res, id);

      if (!isAuthorized) {
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Usuário nao autorizado",
        });
      }
      const result = await this.resetPasswordUserService.handle({ ...data });
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
