import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { GetByIdNotificationUseCaseProtocol } from "../interfaces/notification/getByIdNotificationUseCaseProtocol";
import { getByIdNotificationValidationSchema } from "../validation/notification/getByIdNotificationValidationSchema";

/**
 * Busca uma notificação por ID e ID do usuário
 *
 * @param {GetByIdNotificationUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.userId - O ID do usuário proprietário da notificação
 * @param {string} data.id - O ID da notificação
 *
 * @returns {Promise<NotificationModel>} A notificação encontrada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se a notificação não for encontrada
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByIdNotificationUseCase
  implements GetByIdNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdNotificationUseCaseProtocol.Params
  ): Promise<NotificationModel> {
    try {
      const validatedData = await getByIdNotificationValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      const notification = await this.notificationRepository.findByIdAndUserId(
        validatedData as GetByIdNotificationUseCaseProtocol.Params
      );

      if (!notification) {
        throw new NotFoundError(
          `Notificação com ID ${data.id} não encontrada para este usuário`
        );
      }

      return notification;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de notificação: ${errorMessage}`);
    }
  }
}
