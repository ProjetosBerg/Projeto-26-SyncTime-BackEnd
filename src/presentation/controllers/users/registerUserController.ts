import { Request, Response } from "express";
import { IResponse, ResponseStatus } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { RegisterUserUseCase } from "@/data/usecases/users/registerUserUseCase";
import cloudinary from "@/config/cloudinary";
import logger from "@/loaders/logger";
import { handleControllerError } from "@/presentation/helpers/handleControllerError";

const cleanupUploadedAvatar = async (publicId: string | null): Promise<void> => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Falha ao limpar imagem após erro no cadastro: ${message}`);
  }
};

export class RegisterUserController implements Controller {
  constructor(private readonly createUserService: RegisterUserUseCase) {
    this.createUserService = createUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    const publicIdToDelete = req.uploadedAvatar?.publicId || null;

    try {
      const {
        name,
        login,
        email,
        password,
        confirmpassword,
        securityQuestions,
      } = req.body;

      let parsedSecurityQuestions = securityQuestions;
      if (typeof securityQuestions === "string") {
        try {
          parsedSecurityQuestions = JSON.parse(securityQuestions);
        } catch {
          await cleanupUploadedAvatar(publicIdToDelete);
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message:
              "Formato inválido para securityQuestions. Deve ser um JSON válido.",
          });
        }
      }

      const createUser = await this.createUserService.handle({
        name,
        login,
        email,
        password,
        confirmpassword,
        securityQuestions: parsedSecurityQuestions,
        imageUrl: req.uploadedAvatar?.imageUrl,
        publicId: req.uploadedAvatar?.publicId,
      });

      const publicUser = createUser?.user
        ? {
            id: createUser.user.id,
            name: createUser.user.name,
            login: createUser.user.login,
            email: createUser.user.email,
            imageUrl: createUser.user.imageUrl,
            bio: createUser.user.bio,
            created_at: createUser.user.created_at,
          }
        : undefined;

      return res.status(201).json({
        status: ResponseStatus.OK,
        data: { user: publicUser },
        message: "Usuário criado com sucesso",
      });
    } catch (error) {
      await cleanupUploadedAvatar(publicIdToDelete);

      return handleControllerError(res, error);
    }
  }
}
