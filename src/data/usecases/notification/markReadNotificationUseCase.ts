import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { MarkReadNotificationUseCaseProtocol } from "../interfaces/notification/markReadNotificationUseCaseProtocol";
import { markReadNotificationValidationSchema } from "../validation/notification/markReadNotificationValidationSchema";

/**
 * Marca uma ou mais notificações como lidas por IDs para um usuário
 *
 * @param {MarkReadNotificationUseCaseProtocol.Params} data - Os dados de entrada para a marcação
 * @param {string} data.userId - O ID do usuário proprietário das notificações
 * @param {string[]} data.ids - Array de IDs das notificações a serem marcadas como lidas
 *
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se nenhuma das notificações for encontrada
 * @throws {ServerError} Se ocorrer um erro inesperado durante a marcação
 */

export class MarkReadNotificationUseCase
  implements MarkReadNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: MarkReadNotificationUseCaseProtocol.Params
  ): Promise<void> {
    try {
      const validatedData = await markReadNotificationValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      await this.notificationRepository.markAsReadNotifications(
        validatedData as MarkReadNotificationUseCaseProtocol.Params
      );
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a marcação";
      throw new ServerError(
        `Falha na marcação de notificações como lidas: ${errorMessage}`
      );
    }
  }
}
