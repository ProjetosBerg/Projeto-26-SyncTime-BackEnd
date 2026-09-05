import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { EditUserByIdUseCase } from "@/data/usecases/users/editUserByIdUseCase";
import { checkUserAuthorization } from "@/presentation/validation/ValidateUser";
import cloudinary from "@/config/cloudinary";
import logger from "@/loaders/logger";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

const cleanupUploadedAvatar = async (publicId: string | null): Promise<void> => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Falha ao limpar o novo avatar: ${message}`);
  }
};

export class EditUserByIdController implements Controller {
  constructor(private readonly editUserByIdService: EditUserByIdUseCase) {
    this.editUserByIdService = editUserByIdService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    const uploadedPublicId = req.uploadedAvatar?.publicId || null;

    try {
      const { id } = req.params;
      const { name, email, securityQuestions, bio } = req.body;

      let parsedSecurityQuestions = securityQuestions;
      if (typeof securityQuestions === "string") {
        try {
          parsedSecurityQuestions = JSON.parse(securityQuestions);
        } catch {
          await cleanupUploadedAvatar(uploadedPublicId);
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message:
              "Formato inválido para securityQuestions. Deve ser um JSON válido.",
          });
        }
      }

      if (!id) {
        await cleanupUploadedAvatar(uploadedPublicId);
        return res.status(400).json({
          status: ResponseStatus.NOT_FOUND,
          message: "Id é obrigatório",
        });
      }

      const isAuthorized = await checkUserAuthorization(req, res, id);
      if (!isAuthorized) {
        await cleanupUploadedAvatar(uploadedPublicId);
        return res.status(401).json({
          status: ResponseStatus.UNAUTHORIZED,
          message: "Usuário não autorizado",
        });
      }

      const result = await this.editUserByIdService.handle({
        id,
        name,
        email,
        securityQuestions: parsedSecurityQuestions,
        bio,
        imageUrl: req.uploadedAvatar?.imageUrl,
        publicId: req.uploadedAvatar?.publicId,
      });

      const publicUser = {
        id: result.id,
        name: result.name,
        login: result.login,
        email: result.email,
        imageUrl: result.imageUrl,
        bio: result.bio,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: publicUser,
        message: "Usuário editado com sucesso",
      });
    } catch (error) {
      await cleanupUploadedAvatar(uploadedPublicId);

      return handleControllerError(res, error);
    }
  }
}
