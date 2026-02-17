import { ServerError } from "@/data/errors/ServerError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { deleteNotificationValidationSchema } from "../validation/notification/deleteNotificationValidationSchema";
import { DeleteNotificationUseCaseProtocol } from "../interfaces/notification/deleteNotificationUseCaseProtocol";

/**
 * Deleta uma ou mais notificações por IDs para um usuário
 *
 * @param {DeleteNotificationUseCaseProtocol.Params} data - Os dados de entrada para a deleção
 * @param {string} data.userId - O ID do usuário proprietário das notificações
 * @param {string[]} data.ids - Array de IDs das notificações a serem deletadas
 *
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a deleção
 */

export class DeleteNotificationUseCase
  implements DeleteNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(data: DeleteNotificationUseCaseProtocol.Params): Promise<void> {
    try {
      const validatedData = await deleteNotificationValidationSchema.validate(
        data,
        {
          abortEarly: false,
        }
      );

      await this.notificationRepository.deleteNotifications(
        validatedData as DeleteNotificationUseCaseProtocol.Params
      );
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(
        `Falha na deleção de notificações: ${errorMessage}`
      );
    }
  }
}
