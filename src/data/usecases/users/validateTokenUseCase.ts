import { ServerError } from "@/data/errors/ServerError";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { UserMonthlyEntryRankRepositoryProtocol } from "@/infra/db/interfaces/userMonthlyEntryRankRepositoryProtocol";
import { ValidateTokenUseCaseProtocol } from "../interfaces/users/validateTokenUseCaseProtocol";
import { getIo } from "@/lib/socket";
import { logger } from "@/loaders";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export class ValidateTokenUseCase implements ValidateTokenUseCaseProtocol {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryProtocol,
    private readonly userMonthlyEntryRankRepository: UserMonthlyEntryRankRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  /**
   * Valida o token e registra a presença/entrada do usuário
   * Para sessões existentes e ativas do DIA ATUAL, incrementa o entryCount e atualiza lastEntryAt
   * (exceto se a última entrada foi há menos de 1 minuto)
   * Para uma sessão ativa de dia anterior, cria apenas o registro diário de presença
   * Isso permite rastrear streak/ofensiva, presença diária e contagem de entradas por dia (via soma de entryCount)
   * @param {ValidateTokenUseCaseProtocol.Params} data - Dados do user do token
   * @param {string} data.userId - ID do usuário
   * @param {string} data.sessionId - ID obrigatório da sessão contida no token
   * @returns {Promise<ValidateTokenUseCaseProtocol.Result>} Dados do user e sessionId
   * @throws {ServerError} Se ocorrer um erro inesperado
   */
  async handle(
    data: ValidateTokenUseCaseProtocol.Params
  ): Promise<ValidateTokenUseCaseProtocol.Result> {
    try {
      if (!data.sessionId) {
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      const sessionId = data.sessionId;
      const now = new Date();

      const activeSession =
        await this.authenticationRepository.findActiveSession({
          userId: data.userId,
          sessionId,
          isOrder: true,
        });

      if (!activeSession) {
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      if (this.isSameDay(activeSession.loginAt, now)) {
        const timeSinceLastEntry =
          now.getTime() - new Date(activeSession.lastEntryAt).getTime();
        const isWithinOneMinute = timeSinceLastEntry < 60000;

        if (!isWithinOneMinute) {
          await this.authenticationRepository.incrementEntryCount({
            userId: data.userId,
            sessionId,
            now,
          });
        }
      } else {
        await this.authenticationRepository.create({
          userId: data.userId,
          sessionId,
          loginAt: now,
          isOffensive: now.getHours() < 12,
        });
      }

      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      let previousRanks =
        await this.userMonthlyEntryRankRepository.getAllRankedForMonth({
          year,
          month,
        });

      previousRanks = previousRanks.filter((pr) => pr.userId !== data.userId);

      await this.userMonthlyEntryRankRepository.updateTotalForUserAndMonth({
        userId: data.userId,
        year,
        month,
      });

      const usersWhoLostPositions =
        await this.userMonthlyEntryRankRepository.findUsersWhoLostPositions({
          year,
          month,
          currentTime: now,
          userId: data.userId,
          previousRanks,
        });
      if (usersWhoLostPositions && usersWhoLostPositions.length > 0) {
        const io = getIo();

        for (const user of usersWhoLostPositions) {
          try {
            const newNotification = await this.notificationRepository.create({
              title: `Você perdeu ${user.positionsLost} ${
                user.positionsLost === 1 ? "posição" : "posições"
              } no ranking mensal. Agora você está em ${user.currentPosition}º lugar.`,
              entity: "Ranking Mensal",
              idEntity: undefined,
              userId: String(user.userId),
              path: "",
              typeOfAction: "Atualização",
            });

            await this.userMonthlyEntryRankRepository.updateLastPositionLossNotification(
              {
                userId: user.userId,
                year,
                month,
                currentRank: user.currentPosition,
                notifiedAt: now,
              }
            );

            const countNewNotification =
              await this.notificationRepository.countNewByUserId({
                userId: user.userId,
              });

            logger.info(
              `Notificação de perda de posição no ranking criada para userId: ${user.userId} - Perdeu ${user.positionsLost} posições, agora está em ${user.currentPosition}º lugar`
            );

            if (io) {
              const notificationData = {
                id: newNotification.id,
                title: newNotification.title,
                entity: newNotification.entity,
                idEntity: newNotification.idEntity,
                typeOfAction: newNotification.typeOfAction,
                payload: newNotification.payload,
                createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
                countNewNotification,
              };
              io.to(`user_${user.userId}`).emit(
                "newNotification",
                notificationData
              );
              logger.info(
                `Notificação de perda de posição no ranking emitida via Socket.IO para userId: ${user.userId}`
              );
            }
          } catch (notificationError: any) {
            logger.error(
              `Erro ao processar notificação para userId ${user.userId}: ${notificationError.message}`
            );
          }
        }
      }

      return {
        valid: true,
        sessionId,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante validação de token";
      console.error("Erro na validação do token:", errorMessage);
      throw new ServerError(`Falha na validação do token: ${errorMessage}`);
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    const first = new Date(date1);
    const second = new Date(date2);

    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }
}
