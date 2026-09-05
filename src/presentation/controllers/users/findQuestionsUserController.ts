import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { ForgotPasswordUserUseCase } from "@/data/usecases/users/forgotPasswordUserUseCase";
import { FindQuestionsUserUseCase } from "@/data/usecases/users/findQuestionsUserUseCase";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

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
      return handleControllerError(res, error);
    }
  }
}
