import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";

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
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Usuário logado com sucesso",
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
