import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { DeleteMonthlyRecordUseCaseProtocol } from "@/data/usecases/interfaces/monthlyRecord/deleteMonthlyRecordUseCaseProtocol";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { deleteMonthlyRecordValidationSchema } from "@/data/usecases/validation/monthlyRecord/deleteMonthlyRecordValidationSchema";
import { getIo } from "@/lib/socket"; // Adicionado: acesso ao io
import logger from "@/loaders/logger"; // Adicionado: para logs (assumindo que você tem)
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";

/**
 * Exclui um registro mensal pelo seu ID para um usuário específico
 *
 * @param {DeleteMonthlyRecordUseCaseProtocol.Params} data - Os dados de entrada para a exclusão do registro mensal
 * @param {string} data.monthlyRecordId - O ID do registro mensal a ser excluído
 * @param {string} data.userId - O ID do usuário proprietário do registro mensal
 *
 * @returns {Promise<void>} É resolvida quando o registro mensal é excluído com sucesso
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário ou o registro mensal não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
 */

export class DeleteMonthlyRecordUseCase
  implements DeleteMonthlyRecordUseCaseProtocol
{
  constructor(
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol,
    private readonly transactionCustomFieldRepository?: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: DeleteMonthlyRecordUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteMonthlyRecordValidationSchema.validate(data, {
        abortEarly: false,
      });
      const userId = String(data.userId);
      const monthlyRecordId = String(data.monthlyRecordId);

      const user = await this.userRepository.findOne({ id: userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: monthlyRecordId,
          userId,
        });

      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${data.monthlyRecordId} não encontrado para este usuário`
        );
      }
      const transactionIds = (monthlyRecord.transactions || []).map(
        (transaction) => transaction.id
      );

      await this.monthlyRecordRepository.delete({
        id: monthlyRecordId,
        userId,
      });

      try {
        await this.transactionCustomFieldRepository?.deleteByTransactionIds?.({
          transaction_ids: transactionIds,
          user_id: userId,
        });
      } catch (cleanupError) {
        logger.error(
          `Registro mensal ${monthlyRecordId} excluído do PostgreSQL, mas houve falha na limpeza do MongoDB: ${
            cleanupError instanceof Error
              ? cleanupError.message
              : String(cleanupError)
          }`
        );
      }

      try {
        const newNotification = await this.notificationRepository.create({
        title: `Registro mensal excluído: ${monthlyRecord.title}`,
        entity: "Registro Mensal",
        idEntity: data.monthlyRecordId,
        userId: data.userId,
        path: `/relatorios/categoria/relatorio-mesal/${monthlyRecord?.category?.id}`,
        typeOfAction: "Exclusão",
      });

        const countNewNotification =
          await this.notificationRepository.countNewByUserId({
            userId: data.userId,
          });

        const io = getIo();
        const now = new Date();
        if (io && newNotification) {
          const notificationData = {
            id: newNotification.id,
            title: newNotification.title,
            entity: newNotification.entity,
            idEntity: newNotification.idEntity,
            path: newNotification.path,
            typeOfAction: newNotification.typeOfAction,
            createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
            countNewNotification: countNewNotification,
          };

          io.to(`user_${data.userId}`).emit(
            "newNotification",
            notificationData
          );
          logger.info(
            `Notificação de exclusão emitida via Socket.IO para userId: ${data.userId} (count: ${countNewNotification})`
          );
        }
      } catch (notificationError) {
        logger.warn(
          `Registro mensal excluído, mas a notificação não foi criada: ${
            notificationError instanceof Error
              ? notificationError.message
              : String(notificationError)
          }`
        );
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(
        `Falha ao deletar o registro mensal: ${errorMessage}`
      );
    }
  }
}
