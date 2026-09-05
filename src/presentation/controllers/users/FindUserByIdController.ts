import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { FindUserByIdUseCase } from "@/data/usecases/users/findUserByIdUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

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
      return handleControllerError(res, error);
    }
  }
}
