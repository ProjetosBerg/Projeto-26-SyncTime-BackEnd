import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { resetPasswordUserValidationSchema } from "../validation/users/resetPasswordUserValidationSchema";
import { ResetPasswordUserUseCaseProtocol } from "../interfaces/users/resetPasswordUseCaseProtocol";

import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

export class ResetPasswordUserUseCase
  implements ResetPasswordUserUseCaseProtocol
{
  constructor(
    private readonly userRepository: UserRepositoryProtocol,
    private readonly userAuth: UserAuth,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: ResetPasswordUserUseCaseProtocol.Params
  ): Promise<ResetPasswordUserUseCaseProtocol.Result> {
    try {
      await resetPasswordUserValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ login: data.login });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      const isOldPasswordValid = await this.userAuth.comparePassword(
        data.oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        throw new BusinessRuleError("Senha antiga incorreta");
      }

      const hashedPassword = await this.userAuth.hashPassword(data.newPassword);

      const updatedUser = await this.userRepository.updatePassword({
        id: user.id,
        password: hashedPassword,
      });

      if (!updatedUser) {
        throw new BusinessRuleError("Falha ao atualizar a senha do usuário");
      }

      const newNotification = await this.notificationRepository.create({
        title: "Senha atualizada com sucesso",
        entity: "Usuario",
        idEntity: user.id,
        userId: user.id,
        typeOfAction: "Atualização",
        path: "/perfil",
        payload: {
          action: "password_updated",
          timestamp: new Date().toISOString(),
        },
      });

      const countNewNotification =
        await this.notificationRepository.countNewByUserId({
          userId: user.id,
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

        io.to(`user_${user.id}`).emit("newNotification", notificationData);
        logger.info(
          `Notificação de alteração de senha emitida via Socket.IO para userId: ${user.id} (count: ${countNewNotification})`
        );
      } else {
        if (!io) {
          logger.warn(
            "Socket.IO não inicializado → notificação de senha não enviada em tempo real"
          );
        }
      }

      return { message: "Senha redefinida com sucesso" };
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
        error.message ||
        "Erro interno do servidor durante a redefinição de senha";
      throw new ServerError(`Falha na redefinição de senha: ${errorMessage}`);
    }
  }
}
