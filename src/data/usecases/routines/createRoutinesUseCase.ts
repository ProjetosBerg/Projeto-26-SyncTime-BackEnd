import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { CreateRoutinesUseCaseProtocol } from "@/data/usecases/interfaces/routines/createRoutinesUseCaseProtocol";
import { createRoutinesValidationSchema } from "@/data/usecases/validation/routines/createRoutinesValidationSchema";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

/**
 * Cria uma nova rotina para um usuário
 *
 * @param {CreateRoutinesUseCaseProtocol.Params} data - Os dados de entrada para a criação da rotina
 * @param {string} data.type - O tipo da rotina
 * @param {Period} [data.period] - O período da rotina (opcional)
 * @param {string} data.userId - O ID do usuário proprietário da rotina
 *
 * @returns {Promise<RoutineModel>} A rotina criada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {BusinessRuleError} Se já existir uma rotina com o mesmo tipo e período para o usuário OU se já existir uma rotina para o período no dia atual
 * @throws {ServerError} Se ocorrer um erro inesperado durante a criação
 */

export class CreateRoutinesUseCase implements CreateRoutinesUseCaseProtocol {
  constructor(
    private readonly routinesRepository: RoutinesRepositoryProtocol
  ) {}

  async handle(
    data: CreateRoutinesUseCaseProtocol.Params
  ): Promise<RoutineModel> {
    try {
      await createRoutinesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const intendedDate = new Date(data.createdAt || new Date());
      intendedDate.setHours(0, 0, 0, 0);
      const startDate = new Date(intendedDate);
      const endDate = new Date(intendedDate);
      endDate.setHours(23, 59, 59, 999);

      const existingRoutine =
        await this.routinesRepository.findByTypeAndPeriodAndUserId({
          type: data.type,
          period: data.period,
          userId: data.userId,
          startDate,
          endDate,
        });

      if (existingRoutine) {
        throw new BusinessRuleError(
          `Já existe uma rotina com o tipo "${data.type}"${data.period ? ` e período "${data.period}"` : " sem período"} para este usuário`
        );
      }

      if (data.period) {
        const existingTodayRoutine =
          await this.routinesRepository.findByPeriodAndUserIdAndDateRange({
            period: data.period,
            userId: data.userId,
            startDate,
            endDate,
          });

        if (existingTodayRoutine) {
          throw new BusinessRuleError(
            `Já existe uma rotina para o período "${data.period}" neste dia para este usuário`
          );
        }
      }

      const createdRoutine = await this.routinesRepository.create({
        type: data.type,
        period: data.period,
        userId: data.userId,
        createdAt: data.createdAt,
      });

      return createdRoutine;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(`Falha no cadastro de rotina: ${errorMessage}`);
    }
  }
}
