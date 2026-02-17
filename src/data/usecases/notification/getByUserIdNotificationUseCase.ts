import { ServerError } from "@/data/errors/ServerError";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { getByUserIdNotificationValidationSchema } from "../validation/notification/getByUserIdNotificationValidationSchema";
import { GetByUserIdNotificationUseCaseProtocol } from "../interfaces/notification/getByUserIdNotificationUseCaseProtocol";

/**
 * Busca notificações por ID do usuário com paginação e filtros
 *
 * @param {GetByUserIdNotificationUseCaseProtocol.Params} data - Os dados de entrada para a busca
 * @param {string} data.userId - O ID do usuário proprietário das notificações
 * @param {number} [data.page] - Página atual (padrão: 1)
 * @param {number} [data.limit] - Limite de registros por página (padrão: 10)
 * @param {string} [data.search] - Termo de busca no título
 * @param {string} [data.sortBy] - Campo para ordenação (padrão: "created_at")
 * @param {string} [data.order] - Direção da ordenação ("ASC" ou "DESC")
 * @param {boolean} [data.isRead] - Filtro por status de lida
 * @param {string} [data.typeOfAction] - Filtro por tipo de ação
 *
 * @returns {Promise<{ notifications: NotificationModel[]; total: number }>} Lista de notificações e total de registros
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */

export class GetByUserIdNotificationUseCase
  implements GetByUserIdNotificationUseCaseProtocol
{
  constructor(
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: GetByUserIdNotificationUseCaseProtocol.Params
  ): Promise<{ notifications: NotificationModel[]; total: number }> {
    try {
      const validatedData =
        await getByUserIdNotificationValidationSchema.validate(data, {
          abortEarly: false,
        });

      const { notifications, total } =
        await this.notificationRepository.findByUserId(
          validatedData as GetByUserIdNotificationUseCaseProtocol.Params
        );

      return {
        notifications,
        total,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca de notificações: ${errorMessage}`);
    }
  }
}
