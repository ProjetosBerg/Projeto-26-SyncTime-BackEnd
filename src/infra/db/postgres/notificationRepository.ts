import { ILike, In, Repository, getRepository } from "typeorm";
import { Notification } from "@/domain/entities/postgres/Notification";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { User } from "@/domain/entities/postgres/User";
import { NotificationRepositoryProtocol } from "../interfaces/notificationRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class NotificationRepository implements NotificationRepositoryProtocol {
  private repository: Repository<Notification>;

  constructor() {
    this.repository = getRepository(Notification);
  }

  /**
   * Cria uma nova Notificação no banco de dados
   * @param {NotificationRepositoryProtocol.CreateNotification} data - Os dados para criação da Notificação
   */
  async create(
    data: NotificationRepositoryProtocol.CreateNotification
  ): Promise<NotificationModel> {
    const notification = this.repository.create({
      title: data.title,
      entity: data.entity,
      idEntity: data.idEntity,
      isRead: false,
      path: data.path,
      payload: data.payload,
      typeOfAction: data.typeOfAction,
      user: { id: data.userId } as User,
    });

    const savedNotification = await this.repository.save(notification);
    return {
      id: savedNotification.id,
      title: savedNotification.title,
      entity: savedNotification.entity,
      idEntity: savedNotification.idEntity,
      isRead: savedNotification.isRead,
      path: savedNotification.path,
      payload: savedNotification.payload,
      typeOfAction: savedNotification.typeOfAction,
      user_id: savedNotification.user.id,
      created_at: savedNotification.created_at,
      updated_at: savedNotification.updated_at,
    };
  }

  /**
   * Busca uma Notificação por ID e ID do usuário
   * @param {NotificationRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID da Notificação
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<NotificationModel | null>} A Notificação encontrada ou null se não existir
   */
  async findByIdAndUserId(
    data: NotificationRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<NotificationModel | null> {
    const notification = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user"],
    });

    if (!notification) return null;

    return {
      id: notification.id,
      title: notification.title,
      entity: notification.entity,
      idEntity: notification.idEntity,
      isRead: notification.isRead,
      path: notification.path,
      payload: notification.payload,
      typeOfAction: notification.typeOfAction,
      user_id: notification.user.id,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
    };
  }

  /**
   * Busca Notificações por ID do usuário
   * @param {NotificationRepositoryProtocol.FindByUserIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<{ notifications: NotificationModel[]; total: number }>} Lista de Notificações encontradas
   */
  async findByUserId(
    data: NotificationRepositoryProtocol.FindByUserIdParams
  ): Promise<{ notifications: NotificationModel[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const search = data.search || "";
    const sortBy = data.sortBy || "created_at";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const isReadFilter =
      data.isRead !== undefined ? { isRead: data.isRead } : {};
    const typeOfActionFilter = data.typeOfAction
      ? { typeOfAction: data.typeOfAction }
      : {};

    const whereCondition = search
      ? [
          {
            title: ILike(`%${search}%`),
            user: { id: data.userId },
            ...isReadFilter,
            ...typeOfActionFilter,
          },
        ]
      : { user: { id: data.userId }, ...isReadFilter, ...typeOfActionFilter };

    const [notifications, total] = await this.repository.findAndCount({
      where: whereCondition,
      relations: ["user"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      entity: notification.entity,
      idEntity: notification.idEntity,
      isRead: notification.isRead,
      path: notification.path,
      payload: notification.payload,
      typeOfAction: notification.typeOfAction,
      user_id: notification.user.id,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
    }));

    return {
      notifications: formattedNotifications,
      total,
    };
  }

  /**
   * Atualiza uma Notificação no banco de dados (principalmente para marcar como lida)
   * @param {NotificationRepositoryProtocol.UpdateNotificationParams} data - Os dados para atualização
   * @param {string} data.id - ID da Notificação
   * @param {string} data.userId - ID do usuário
   * @param {boolean} [data.isRead] - Novo status de lida
   * @param {string} [data.typeOfAction] - Novo tipo de ação (raro, mas possível)
   * @returns {Promise<NotificationModel>} A Notificação atualizada
   * @throws {NotFoundError} Quando a Notificação não é encontrada
   */
  async updateNotification(
    data: NotificationRepositoryProtocol.UpdateNotificationParams
  ): Promise<NotificationModel> {
    const notification = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user"],
    });

    if (!notification) {
      throw new NotFoundError(
        `Notificação com ID ${data.id} não encontrada para este usuário`
      );
    }

    if (data.isRead !== undefined) notification.isRead = data.isRead;
    if (data.typeOfAction !== undefined)
      notification.typeOfAction = data.typeOfAction;

    const updatedNotification = await this.repository.save(notification);
    return {
      id: updatedNotification.id,
      title: updatedNotification.title,
      entity: updatedNotification.entity,
      idEntity: updatedNotification.idEntity,
      isRead: updatedNotification.isRead,
      path: updatedNotification.path,
      payload: updatedNotification.payload,
      typeOfAction: updatedNotification.typeOfAction,
      user_id: updatedNotification.user.id,
      created_at: updatedNotification.created_at,
      updated_at: updatedNotification.updated_at,
    };
  }

  /**
   * Deleta múltiplas notificações do banco de dados por IDs e ID do usuário
   * @param {NotificationRepositoryProtocol.DeleteNotificationsParams} data - Os dados para deleção
   * @param {string} data.userId - ID do usuário
   * @param {string[]} data.ids - Array de IDs das notificações
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando nenhuma das notificações é encontrada (opcional, dependendo da lógica desejada)
   */
  async deleteNotifications(
    data: NotificationRepositoryProtocol.DeleteNotificationsParams
  ): Promise<void> {
    const { affected } = await this.repository.delete({
      id: In(data.ids),
      user: { id: data.userId },
    });

    if (affected === 0) {
      throw new NotFoundError(
        `Nenhuma notificação encontrada para os IDs fornecidos para este usuário`
      );
    }
  }

  /**
   * Marca múltiplas notificações como lidas no banco de dados por IDs e ID do usuário
   * @param {NotificationRepositoryProtocol.MarkAsReadNotificationsParams} data - Os dados para marcação
   * @param {string} data.userId - ID do usuário
   * @param {string[]} data.ids - Array de IDs das notificações
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando nenhuma das notificações é encontrada
   */
  async markAsReadNotifications(
    data: NotificationRepositoryProtocol.MarkAsReadNotificationsParams
  ): Promise<void> {
    const { affected } = await this.repository.update(
      {
        id: In(data.ids),
        user: { id: data.userId },
      },
      { isRead: true }
    );

    if (affected === 0) {
      throw new NotFoundError(
        `Nenhuma notificação encontrada para os IDs fornecidos para este usuário`
      );
    }
  }

  /**
   * Conta o número de notificações novas (isNew = true) por ID do usuário
   * @param {NotificationRepositoryProtocol.CountNewByUserIdParams} data - Os dados para contagem
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<number>} O número de notificações novas
   */
  async countNewByUserId(
    data: NotificationRepositoryProtocol.CountNewByUserIdParams
  ): Promise<number> {
    return await this.repository.count({
      where: {
        user: { id: data.userId },
        isNew: true,
      },
    });
  }

  /**
   * Atualiza todas as notificações novas (isNew = true) para isNew = false por ID do usuário
   * @param {NotificationRepositoryProtocol.UpdateAllNewToFalseByUserIdParams} data - Os dados para atualização
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando nenhuma notificação nova é encontrada
   */
  async updateAllNewToFalseByUserId(
    data: NotificationRepositoryProtocol.UpdateAllNewToFalseByUserIdParams
  ): Promise<void> {
    const { affected } = await this.repository.update(
      {
        user: { id: data.userId },
        isNew: true,
      },
      { isNew: false }
    );
  }
}
