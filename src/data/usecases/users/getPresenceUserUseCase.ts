import { ServerError } from "@/data/errors/ServerError";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { GetPresenceUserProtocol } from "../interfaces/users/getPresenceUserProtocol";

export class GetPresenceUserUseCase implements GetPresenceUserProtocol {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryProtocol
  ) {}

  /**
   * Obtém dados de presença para um mês/ano específico, incluindo presença diária e contagem de sessões
   * Baseado nos registros de login no período
   */
  async handle(
    data: GetPresenceUserProtocol.Params
  ): Promise<GetPresenceUserProtocol.Result> {
    try {
      const { userId, month, year } = data;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      const allLogins = await this.authenticationRepository.findByUserAndPeriod(
        {
          userId,
          startDate,
          endDate,
        }
      );

      const dailyData: {
        [day: string]: { present: boolean; sessions: number };
      } = {};

      allLogins.forEach((login) => {
        const loginDate = new Date(login.loginAt);
        const dayKey = loginDate.toISOString().split("T")[0];

        if (!dailyData[dayKey]) {
          dailyData[dayKey] = { present: true, sessions: 0 };
        }

        dailyData[dayKey].sessions += login.entryCount || 1;
      });

      const monthDays = endDate.getDate();
      const presenceData: {
        day: string;
        present: boolean;
        sessions: number;
      }[] = [];

      for (let day = 1; day <= monthDays; day++) {
        const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayData = dailyData[dayKey] || { present: false, sessions: 0 };
        presenceData.push({
          day: String(day).padStart(2, "0"),
          present: dayData.present,
          sessions: dayData.sessions,
        });
      }

      const presentDays = presenceData.filter((d) => d.present).length;
      const totalSessions = presenceData.reduce(
        (acc, d) => acc + d.sessions,
        0
      );
      const rate = Math.round((presentDays / presenceData.length) * 100);

      return {
        presenceData,
        stats: {
          presentDays,
          totalSessions,
          rate,
        },
      };
    } catch (error: any) {
      const errorMessage =
        error.message || "Erro interno do servidor ao obter dados de presença";
      console.error("Erro ao obter dados de presença:", errorMessage);
      throw new ServerError(
        `Falha ao obter dados de presença: ${errorMessage}`
      );
    }
  }
}
