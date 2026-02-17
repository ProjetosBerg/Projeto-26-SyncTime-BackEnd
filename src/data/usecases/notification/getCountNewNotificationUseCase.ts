import { ServerError } from "@/data/errors/ServerError";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { GetCountNewNotificationUseCaseProtocol } from "../interfaces/notification/getCountNewNotificationUseCaseProtocol";
import { getCountNewNotificationValidationSchema } from "../validation/notification/getCountNewNotificationValidationSchema";

/**
 * Busca a contagem de notificações novas por ID do usuário
 *
 * @param {GetCountNewNotificationUseCaseProtocol.Params} data - Os dados de entrada para a contagem
 * @param {string} data.userId - O ID do usuário proprietário das notificações
 *
 * @returns {Promise<number>} O número de notificações novas
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a contagem
 */

export class GetCountNewNotificationUseCase
  implements GetCountNewNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: GetCountNewNotificationUseCaseProtocol.Params
  ): Promise<number> {
    try {
      const validatedData =
        await getCountNewNotificationValidationSchema.validate(data, {
          abortEarly: false,
        });

      const count = await this.notificationRepository.countNewByUserId(
        validatedData as GetCountNewNotificationUseCaseProtocol.Params
      );

      return count;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a contagem";
      throw new ServerError(
        `Falha na contagem de notificações novas: ${errorMessage}`
      );
    }
  }
}
