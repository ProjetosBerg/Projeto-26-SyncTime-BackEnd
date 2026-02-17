import { Request, Response } from "express";
import { ValidationError } from "yup";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { RegisterUserUseCase } from "@/data/usecases/users/registerUserUseCase";
import cloudinary from "@/config/cloudinary";

export class RegisterUserController implements Controller {
  constructor(private readonly createUserService: RegisterUserUseCase) {
    this.createUserService = createUserService;
  }

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    let publicIdToDelete: string | null = null;
    try {
      const {
        name,
        login,
        email,
        password,
        confirmpassword,
        securityQuestions,
        imageUrl,
        publicId,
      } = req.body;

      let parsedSecurityQuestions = securityQuestions;
      if (typeof securityQuestions === "string") {
        try {
          parsedSecurityQuestions = JSON.parse(securityQuestions);
        } catch (parseError) {
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message:
              "Formato inválido para securityQuestions. Deve ser um JSON válido.",
          });
        }
      }

      const data = {
        name,
        login,
        email,
        password,
        confirmpassword,
        securityQuestions: parsedSecurityQuestions,
        imageUrl,
        publicId,
      };

      if (publicId) {
        publicIdToDelete = publicId;
      }

      const createUser = await this.createUserService.handle({ ...data });
      return res.status(201).json({
        status: ResponseStatus.OK,
        data: createUser,
        message: "Usuário criado com sucesso",
      });
    } catch (error) {
      if (publicIdToDelete) {
        try {
          await cloudinary.uploader.destroy(publicIdToDelete);
        } catch (deleteError) {
          const message =
            deleteError instanceof Error
              ? deleteError.message
              : String(deleteError);
          throw new Error(
            `Erro ao deletar imagem após falha no cadastro: ${message}`
          );
        }
      }

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
