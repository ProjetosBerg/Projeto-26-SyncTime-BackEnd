import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { DeleteUserByIdUseCase } from "@/data/usecases/users/deleteUserByIdUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";
import cloudinary from "@/config/cloudinary";
import logger from "@/loaders/logger";

export class DeleteUserByIdController implements Controller {
  constructor(private readonly deleteUserByIdService: DeleteUserByIdUseCase) {
    this.deleteUserByIdService = deleteUserByIdService;
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
      const result = await this.deleteUserByIdService.handle({ id });
      if (result.deletedAvatarPublicId) {
        try {
          await cloudinary.uploader.destroy(result.deletedAvatarPublicId);
        } catch (cleanupError) {
          logger.error(
            `Conta ${id} excluída, mas o avatar não foi removido: ${
              cleanupError instanceof Error
                ? cleanupError.message
                : String(cleanupError)
            }`
          );
        }
      }
      return res.status(200).json({
        status: ResponseStatus.OK,
        data: { message: result.message },
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
