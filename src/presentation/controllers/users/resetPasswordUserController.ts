import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import { ResetPasswordUserUseCase } from "@/data/usecases/users/resetPasswordUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

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
      const { newPassword, confirmNewPassword, id, oldPassword } =
        req.body;
      const data = {
        login: String(req.user?.login || ""),
        oldPassword,
        newPassword,
        confirmNewPassword,
        sessionId: String(req.user?.sessionId || ""),
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
      return handleControllerError(res, error);
    }
  }
}
