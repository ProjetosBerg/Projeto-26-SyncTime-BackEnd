import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { EditMonthlyRecordUseCaseProtocol } from "@/data/usecases/interfaces/monthlyRecord/editMonthlyRecordUseCaseProtocol";
import { MonthlyRecordMock } from "@/domain/models/postgres/MonthlyRecordModel";
import { editMonthlyRecordValidationSchema } from "@/data/usecases/validation/monthlyRecord/editMonthlyRecordValidationSchema";
import { getIo } from "@/lib/socket"; // Adicionado: acesso ao io
import logger from "@/loaders/logger"; // Adicionado: para logs (assumindo que você tem)

/**
 * Atualiza um registro mensal existente para um usuário específico
 *
 * @param {EditMonthlyRecordUseCaseProtocol.Params} data - Os dados de entrada para a atualização do registro mensal
 * @param {string} data.monthlyRecordId - O ID do registro mensal a ser atualizado
 * @param {string} data.userId - O ID do usuário proprietário do registro mensal
 * @param {string} [data.title] - O novo título do registro mensal (opcional)
 * @param {string | null} [data.description] - A nova descrição do registro mensal (opcional)
 * @param {string} [data.goal] - O novo objetivo do registro mensal (opcional)
 * @param {number | null} [data.initial_balance] - O novo saldo inicial do registro mensal (opcional)
 * @param {string} [data.categoryId] - O novo ID da categoria do registro mensal (opcional)
 *
 * @returns {Promise<MonthlyRecordModel>} O registro mensal atualizado
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, a categoria ou o registro mensal não forem encontrados
 * @throws {BusinessRuleError} Se já existir um registro mensal para a nova categoria, usuário, mês e ano
 * @throws {ServerError} Se ocorrer um erro inesperado durante a atualização
 */

export class EditMonthlyRecordUseCase
  implements EditMonthlyRecordUseCaseProtocol
{
  constructor(
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: EditMonthlyRecordUseCaseProtocol.Params
  ): Promise<MonthlyRecordMock> {
    try {
      await editMonthlyRecordValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: data.monthlyRecordId,
          userId: data.userId,
        });
      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${data.monthlyRecordId} não encontrado para este usuário`
        );
      }

      if (data.categoryId) {
        const category = await this.categoryRepository.findByIdAndUserId({
          id: data.categoryId,
          userId: data.userId,
        });
        if (!category) {
          throw new NotFoundError(
            `Categoria com ID ${data.categoryId} não encontrada para este usuário`
          );
        }

        const existingRecord =
          await this.monthlyRecordRepository.findOneMonthlyRecord({
            userId: data.userId,
            categoryId: data.categoryId,
            month: monthlyRecord.month,
            year: monthlyRecord.year,
          });

        if (existingRecord && existingRecord.id !== data.monthlyRecordId) {
          throw new BusinessRuleError(
            `Já existe um registro mensal para esta categoria, usuário, mês ${monthlyRecord.month} e ano ${monthlyRecord.year}`
          );
        }
      }

      const updatedMonthlyRecord = await this.monthlyRecordRepository.update({
        id: data.monthlyRecordId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        goal: data.goal,
        initial_balance: data.initial_balance,
        categoryId: data.categoryId,
        status: data.status,
      });

      const newNotification = await this.notificationRepository.create({
        title: `Registro mensal atualizado: ${updatedMonthlyRecord.title}`,
        entity: "Registro Mensal",
        idEntity: data.monthlyRecordId,
        userId: data.userId,
        path: `/relatorios/categoria/relatorio-mesal/${updatedMonthlyRecord?.category?.id}`,
        typeOfAction: "Atualização",
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

        io.to(`user_${data.userId}`).emit("newNotification", notificationData);
        logger.info(
          `Notificação de atualização emitida via Socket.IO para userId: ${data.userId} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado ou notificação nula; notificação não emitida em tempo real"
        );
      }

      return updatedMonthlyRecord;
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
        error.message || "Erro interno do servidor durante a atualização";
      throw new ServerError(
        `Falha na atualização do registro mensal: ${errorMessage}`
      );
    }
  }
}
