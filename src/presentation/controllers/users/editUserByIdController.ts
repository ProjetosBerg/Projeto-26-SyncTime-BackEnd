import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditUserByIdUseCase } from "@/data/usecases/users/editUserByIdUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";

export class EditUserByIdController implements Controller {
  constructor(private readonly editUserByIdService: EditUserByIdUseCase) {
    this.editUserByIdService = editUserByIdService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const { id } = req.params;
      const { name, email, securityQuestions, bio, imageUrl, publicId } =
        req.body;

      const data = {
        name,
        email,
        securityQuestions,
        bio,
        imageUrl,
        publicId,
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
      const result = await this.editUserByIdService.handle({ ...data, id });
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: result,
        message: "Usuário editado com sucesso",
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
