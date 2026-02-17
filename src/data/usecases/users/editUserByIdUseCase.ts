import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { EditUserByIdUseCaseProtocol } from "../interfaces/users/editUserByIdUseCaseProtocol";
import { editUserByIdValidationSchema } from "../validation/users/editUserByIdValidationSchema";
import UserAuth from "@/auth/users/userAuth";
import cloudinary from "@/config/cloudinary";

import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

export class EditUserByIdUseCase implements EditUserByIdUseCaseProtocol {
  constructor(
    private readonly userRepository: UserRepositoryProtocol,
    private readonly userAuth: UserAuth,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: EditUserByIdUseCaseProtocol.Params
  ): Promise<EditUserByIdUseCaseProtocol.Result> {
    try {
      await editUserByIdValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.id });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      if (data?.email && data?.email !== user?.email) {
        const existingUser = await this.userRepository.findOne({
          email: data.email,
        });
        if (existingUser && existingUser.id !== data.id) {
          throw new BusinessRuleError("O email fornecido já está em uso");
        }
      }

      const hashedSecurityQuestions = data?.securityQuestions
        ? await Promise.all(
            data.securityQuestions.map(async (sq) => ({
              question: sq.question,
              answer: await this.userAuth.hashSecurityAnswer(String(sq.answer)),
            }))
          )
        : undefined;

      if (data.publicId && user.publicId && user.publicId !== data.publicId) {
        try {
          await cloudinary.uploader.destroy(user.publicId);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          throw new ServerError(`Falha ao deletar a imagem antiga: ${message}`);
        }
      }

      const updatedUser = await this.userRepository.updateUser({
        id: data?.id,
        name: data?.name,
        email: data?.email,
        securityQuestions: hashedSecurityQuestions,
        bio: data?.bio,
        imageUrl: data?.imageUrl,
        publicId: data?.publicId,
      });

      if (!updatedUser) {
        throw new BusinessRuleError("Falha ao atualizar os dados do usuário");
      }

      const newNotification = await this.notificationRepository.create({
        title: "Perfil atualizado com sucesso",
        entity: "Usuario",
        idEntity: data.id,
        userId: data.id,
        typeOfAction: "Atualização",
        payload: {
          updatedFields: Object.keys(data).filter(
            (key) =>
              key !== "id" && data[key as keyof typeof data] !== undefined
          ),
          name: updatedUser.name,
          email: updatedUser.email,
          hasNewAvatar: !!data.imageUrl,
        },
      });

      const countNewNotification =
        await this.notificationRepository.countNewByUserId({
          userId: data.id,
        });

      const io = getIo();
      const now = new Date();
      if (io && newNotification) {
        const notificationData = {
          id: newNotification.id,
          title: newNotification.title,
          entity: newNotification.entity,
          idEntity: newNotification.idEntity,
          path: newNotification.path || "/perfil",
          typeOfAction: newNotification.typeOfAction,
          payload: newNotification.payload,
          createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          countNewNotification,
        };

        io.to(`user_${data.id}`).emit("newNotification", notificationData);
        logger.info(
          `Notificação de atualização de perfil emitida via Socket.IO para userId: ${data.id} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado → notificação de perfil não enviada em tempo real"
        );
      }

      return updatedUser;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (
        error instanceof BusinessRuleError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a edição do usuário";
      throw new ServerError(`Falha na edição do usuário: ${errorMessage}`);
    }
  }
}
