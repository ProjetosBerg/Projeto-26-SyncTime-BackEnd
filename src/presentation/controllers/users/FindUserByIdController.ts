import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { FindUserByIdUseCase } from "@/data/usecases/users/findUserByIdUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";

export class FindUserByIdController implements Controller {
  constructor(private readonly findUserByIdService: FindUserByIdUseCase) {
    this.findUserByIdService = findUserByIdService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
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
      const result = await this.findUserByIdService.handle({ id });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Usuário obtido com sucesso",
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
