import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { UpdateAllNewNotificationUseCaseProtocol } from "../interfaces/notification/updateAllNewNotificationUseCaseProtocol";
import { updateAllNewNotificationValidationSchema } from "../validation/notification/updateAllNewNotificationValidationSchema";

/**
 * Atualiza todas as notificações novas (isNew = true) para isNew = false por ID do usuário
 *
 * @param {UpdateAllNewNotificationUseCaseProtocol.Params} data - Os dados de entrada para a atualização
 * @param {string} data.userId - O ID do usuário proprietário das notificações
 *
 * @returns {Promise<void>}
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se nenhuma notificação nova for encontrada
 * @throws {ServerError} Se ocorrer um erro inesperado durante a atualização
 */

export class UpdateAllNewNotificationUseCase
  implements UpdateAllNewNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: UpdateAllNewNotificationUseCaseProtocol.Params
  ): Promise<void> {
    try {
      const validatedData =
        await updateAllNewNotificationValidationSchema.validate(data, {
          abortEarly: false,
        });

      await this.notificationRepository.updateAllNewToFalseByUserId(
        validatedData as UpdateAllNewNotificationUseCaseProtocol.Params
      );
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a atualização";
      throw new ServerError(
        `Falha na atualização de notificações novas: ${errorMessage}`
      );
    }
  }
}
