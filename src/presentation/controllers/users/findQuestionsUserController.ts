import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";
import { FindQuestionsUserUseCase } from "@/data/usecases/users/findQuestionsUserUseCase";

export class FindQuestionsController implements Controller {
  constructor(
    private readonly findQuestionsUserService: FindQuestionsUserUseCase
  ) {
    this.findQuestionsUserService = findQuestionsUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { login } = req.query;

      const result = await this.findQuestionsUserService.handle({
        login: login as string,
      });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Perguntas obtidas com sucesso",
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
