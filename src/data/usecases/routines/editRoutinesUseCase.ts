import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { RoutineModel } from "@/domain/models/postgres/RoutinModel";
import { EditRoutinesUseCaseProtocol } from "../interfaces/routines/editRoutinesUseCaseProtocol";
import { editRoutinesValidationSchema } from "../validation/routines/editRoutinesValidationSchema";

/**
 * Edita uma rotina existente para um usuário
 *
 * @param {EditRoutinesUseCaseProtocol.Params} data - Os dados de entrada para a edição da rotina
 * @param {string} [data.type] - O novo tipo da rotina (opcional)
 * @param {Period} [data.period] - O novo período da rotina (opcional)
 * @param {string} data.routineId - O ID da rotina a ser editada
 * @param {string} data.userId - O ID do usuário proprietário da rotina
 *
 * @returns {Promise<RoutineModel>} A rotina editada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se a rotina não for encontrada para o usuário
 * @throws {BusinessRuleError} Se o novo tipo e período já existirem para o usuário (excluindo a atual) OU se o novo período já tiver uma rotina no dia atual (excluindo a atual)
 * @throws {ServerError} Se ocorrer um erro inesperado durante a edição
 */

export class EditRoutinesUseCase implements EditRoutinesUseCaseProtocol {
  constructor(
    private readonly routinesRepository: RoutinesRepositoryProtocol
  ) {}

  async handle(
    data: EditRoutinesUseCaseProtocol.Params
  ): Promise<RoutineModel> {
    try {
      await editRoutinesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingRoutine = await this.routinesRepository.findByIdAndUserId({
        id: data.routineId,
        userId: data.userId,
      });

      if (!existingRoutine) {
        throw new NotFoundError(
          `Rotina com ID ${data.routineId} não encontrada para este usuário`
        );
      }

      const newType = data.type || existingRoutine.type;
      const newPeriod =
        data.period !== undefined ? data.period : existingRoutine.period;
      const hasChanges =
        data.type !== existingRoutine.type ||
        data.period !== existingRoutine.period;

      if (hasChanges) {
        const existingDuplicate =
          await this.routinesRepository.findByTypeAndPeriodAndUserId({
            type: newType,
            period: newPeriod,
            userId: data.userId,
            excludeId: data.routineId,
          });

        if (existingDuplicate) {
          throw new BusinessRuleError(
            `Já existe uma rotina com o tipo "${newType}"${newPeriod ? ` e período "${newPeriod}"` : " sem período"} para este usuário`
          );
        }

        if (newPeriod) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          const existingToday =
            await this.routinesRepository.findByPeriodAndUserIdAndDateRange({
              period: newPeriod,
              userId: data.userId,
              startDate: todayStart,
              endDate: todayEnd,
              excludeId: data.routineId,
            });

          if (existingToday) {
            throw new BusinessRuleError(
              `Já existe uma rotina para o período "${newPeriod}" neste dia para este usuário`
            );
          }
        }
      }

      const updatedRoutine = await this.routinesRepository.updateRoutine({
        id: String(data.routineId),
        type: data.type,
        period: data.period,
        userId: data.userId,
      });

      return updatedRoutine;
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
        error.message || "Erro interno do servidor durante a edição";
      throw new ServerError(`Falha na edição de rotina: ${errorMessage}`);
    }
  }
}
