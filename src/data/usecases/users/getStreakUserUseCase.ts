import { ServerError } from "@/data/errors/ServerError";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { GetStreakUserProtocol } from "../interfaces/users/getStreakUserProtocol";

export class GetStreakUserUseCase implements GetStreakUserProtocol {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryProtocol
  ) {}

  /**
   * Obtém dados de streak (dias consecutivos de login ofensivo) e progresso semanal de ofensiva
   * Baseado nos registros de login ofensivo no período
   */
  async handle(
    data: GetStreakUserProtocol.Params
  ): Promise<GetStreakUserProtocol.Result> {
    try {
      const { userId } = data;
      const today = new Date();

      const streak = await this.calculateStreak(userId, today);

      const weekProgressData = await this.getWeekProgress(userId, today);

      return {
        streakDays: streak,
        weekProgress: weekProgressData.progress,
        completedDaysThisWeek: weekProgressData.completedDays,
      };
    } catch (error: any) {
      const errorMessage =
        error.message || "Erro interno do servidor ao obter dados de streak";
      console.error("Erro ao obter dados de streak:", errorMessage);
      throw new ServerError(`Falha ao obter dados de streak: ${errorMessage}`);
    }
  }

  /**
   * Calcula o streak (dias consecutivos de login ofensivo)
   */
  private async calculateStreak(
    userId: string,
    currentDate: Date
  ): Promise<number> {
    let streak = 0;
    let checkDate = new Date(currentDate);
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const hasOffensiveLogin =
        await this.authenticationRepository.hasOffensiveLoginInDay({
          userId,
          date: checkDate,
        });

      if (!hasOffensiveLogin) {
        break;
      }

      streak++;

      checkDate.setDate(checkDate.getDate() - 1);

      if (streak > 365) {
        break;
      }
    }

    return streak;
  }

  /**
   * Obtém o progresso da semana atual (logins ofensivos)
   */
  private async getWeekProgress(
    userId: string,
    currentDate: Date
  ): Promise<{ progress: boolean[]; completedDays: number }> {
    const progress: boolean[] = [];
    let completedDays = 0;

    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(checkDate.getDate() + i);

      if (checkDate > currentDate) {
        progress.push(false);
        continue;
      }

      const hasOffensiveLogin =
        await this.authenticationRepository.hasOffensiveLoginInDay({
          userId,
          date: checkDate,
        });

      progress.push(hasOffensiveLogin);

      if (hasOffensiveLogin) {
        completedDays++;
      }
    }

    return { progress, completedDays };
  }
}
