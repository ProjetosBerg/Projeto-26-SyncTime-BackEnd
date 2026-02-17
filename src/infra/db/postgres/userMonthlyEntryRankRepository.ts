import { UserMonthlyEntryRank } from "@/domain/entities/postgres/UserMonthlyEntryRank";
import { Authentication } from "@/domain/entities/postgres/Authentication";
import { getRepository } from "typeorm";
import { UserMonthlyEntryRankRepositoryProtocol } from "../interfaces/userMonthlyEntryRankRepositoryProtocol";

export class UserMonthlyEntryRankRepository
  implements UserMonthlyEntryRankRepositoryProtocol
{
  constructor() {}

  /**
   * Obtém a lista paginada de usuários ranqueados por total de entradas em um mês/ano específico (descendente ou ascendente).
   * @param {Object} data - Dados para o rank
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês (1-12)
   * @param {number} [data.page=1] - Página atual
   * @param {number} [data.limit=10] - Limite por página
   * @param {string} [data.order="DESC"] - Ordem (ASC ou DESC)
   * @returns {Promise<{rankedUsers: {userId: string, totalEntries: number, rank: number}[], total: number}>} Lista paginada ranqueada e total
   */

  /**
   * Busca um registro de rank mensal por userId, year e month.
   * @param {Object} data - Dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês (1-12)
   * @returns {Promise<UserMonthlyEntryRank | undefined>} O registro ou undefined se não encontrado
   */
  async findOneRankUser(data: {
    userId: string;
    year: number;
    month: number;
  }): Promise<UserMonthlyEntryRank | null> {
    try {
      const rankRepo = getRepository(UserMonthlyEntryRank);
      return await rankRepo.findOne({
        where: { userId: data.userId, year: data.year, month: data.month },
      });
    } catch (error: any) {
      throw new Error(`Erro ao buscar rank: ${error.message}`);
    }
  }

  async getAllRankedForMonthPaginated(data: {
    year: number;
    month: number;
    page?: number;
    limit?: number;
    order?: string;
  }): Promise<{
    rankedUsers: {
      userId: string;
      name: string;
      totalEntries: number;
      rank: number;
    }[];
    total: number;
  }> {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const orderDirection = data.order === "ASC" ? "ASC" : "DESC";

      const rankRepo = getRepository(UserMonthlyEntryRank);
      const [ranks, total] = await rankRepo.findAndCount({
        where: { year: data.year, month: data.month },
        order: { totalEntries: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
        relations: ["user"],
      });

      const ranked: {
        userId: string;
        name: string;
        totalEntries: number;
        rank: number;
      }[] = [];
      let currentRank = (page - 1) * limit + 1;
      let prevTotal = -1;

      for (const r of ranks) {
        if (r.totalEntries !== prevTotal) {
          currentRank = (page - 1) * limit + ranked.length + 1;
          prevTotal = r.totalEntries;
        }
        ranked.push({
          userId: r.userId,
          name: r.user.name,
          totalEntries: r.totalEntries,
          rank: currentRank,
        });
      }

      return { rankedUsers: ranked, total };
    } catch (error: any) {
      throw new Error(
        `Erro ao obter ranking mensal paginado: ${error.message}`
      );
    }
  }

  /**
   * Atualiza o total de entradas para um usuário em um mês/ano específico, calculando a soma de entryCount das autenticações nesse período.
   * @param {Object} data - Dados para atualização
   * @param {string} data.userId - ID do usuário
   * @param {number} data.year - Ano (ex.: 2025)
   * @param {number} data.month - Mês (1-12)
   * @returns {Promise<UserMonthlyEntryRank>} O registro atualizado ou criado
   */
  async updateTotalForUserAndMonth(data: {
    userId: string;
    year: number;
    month: number;
  }): Promise<UserMonthlyEntryRank> {
    try {
      const startOfMonth = new Date(data.year, data.month - 1, 1);
      const endOfMonth = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      const authRepo = getRepository(Authentication);
      const sumResult = await authRepo
        .createQueryBuilder("auth")
        .select("SUM(auth.entryCount)", "total")
        .where("auth.userId = :userId", { userId: data.userId })
        .andWhere("auth.loginAt BETWEEN :start AND :end", {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne();

      const totalEntries = parseInt(sumResult?.total) || 0;

      const rankRepo = getRepository(UserMonthlyEntryRank);
      let rank = await rankRepo.findOne({
        where: { userId: data.userId, year: data.year, month: data.month },
      });

      if (!rank) {
        rank = rankRepo.create({
          userId: data.userId,
          year: data.year,
          month: data.month,
          totalEntries,
        });
      } else {
        rank.totalEntries = totalEntries;
      }

      return await rankRepo.save(rank);
    } catch (error: any) {
      throw new Error(
        `Erro ao atualizar total mensal de entradas: ${error.message}`
      );
    }
  }

  /**
   * Obtém a lista de todos os usuários ranqueados por total de entradas em um mês/ano específico (descendente).
   * @param {Object} data - Dados para o rank
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês (1-12)
   * @returns {Promise<{userId: string, totalEntries: number, rank: number}[]>} Lista ranqueada
   */
  async getAllRankedForMonth(data: {
    year: number;
    month: number;
  }): Promise<{ userId: string; totalEntries: number; rank: number }[]> {
    try {
      const rankRepo = getRepository(UserMonthlyEntryRank);
      const ranks = await rankRepo.find({
        where: { year: data.year, month: data.month },
        order: { totalEntries: "DESC" },
      });

      const ranked: { userId: string; totalEntries: number; rank: number }[] =
        [];
      let currentRank = 1;
      let prevTotal = -1;

      for (const r of ranks) {
        if (r.totalEntries !== prevTotal) {
          currentRank = ranked.length + 1;
          prevTotal = r.totalEntries;
        }
        ranked.push({
          userId: r.userId,
          totalEntries: r.totalEntries,
          rank: currentRank,
        });
      }

      return ranked;
    } catch (error: any) {
      throw new Error(`Erro ao obter ranking mensal: ${error.message}`);
    }
  }

  /**
   * Obtém o rank de um usuário específico em um mês/ano.
   * @param {Object} data - Dados para o rank
   * @param {string} data.userId - ID do usuário
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês (1-12)
   * @returns {Promise<number | undefined>} O rank ou undefined se não existir
   */
  async getUserRankForMonth(data: {
    userId: string;
    year: number;
    month: number;
  }): Promise<number | undefined> {
    try {
      const rankRepo = getRepository(UserMonthlyEntryRank);
      const userRank = await rankRepo.findOne({
        where: { userId: data.userId, year: data.year, month: data.month },
      });
      if (!userRank) return undefined;

      const higherCount = await rankRepo
        .createQueryBuilder("rank")
        .where("rank.year = :year", { year: data.year })
        .andWhere("rank.month = :month", { month: data.month })
        .andWhere("rank.totalEntries > :total", {
          total: userRank.totalEntries,
        })
        .getCount();

      return higherCount + 1;
    } catch (error: any) {
      throw new Error(`Erro ao obter rank mensal do usuário: ${error.message}`);
    }
  }

  /**
   * Encontra usuários que perderam posições no rank em comparação com o processamento anterior.
   * Compara o ranking atual do mês (até agora) com o ranking do mês até o horário anterior.
   * @param {Object} data - Dados para a verificação
   * @param {number} data.year - Ano atual
   * @param {number} data.month - Mês atual (1-12)
   * @param {Date} data.currentTime - Horário atual do processamento
   * @param {string} data.userId - ID do usuário que está fazendo a requisição (será excluído)
   * @returns {Promise<{ userId: string; positionsLost: number; currentPosition: number }[]>} Lista de usuários que perderam posições
   */
  async findUsersWhoLostPositions(data: {
    year: number;
    month: number;
    currentTime: Date;
    userId: string;
    previousRanks: { userId: string; rank: number }[];
  }): Promise<
    {
      userId: string;
      positionsLost: number;
      currentPosition: number;
    }[]
  > {
    try {
      const startOfMonth = new Date(data.year, data.month - 1, 1);
      const currentTime = data.currentTime;

      const currentRanks = await this.getRankingForPeriod(
        startOfMonth,
        currentTime
      );

      const prevRankMap = new Map<string, number>();
      data.previousRanks.forEach((r) => {
        prevRankMap.set(r.userId, r.rank);
      });

      const lostPositions: {
        userId: string;
        positionsLost: number;
        currentPosition: number;
      }[] = [];

      for (const current of currentRanks) {
        if (current.userId === data.userId) {
          continue;
        }

        const prevRank = prevRankMap.get(current.userId);

        if (prevRank !== undefined && current.rank > prevRank) {
          const positionsLost = current.rank - prevRank;

          const wasNotified = await this.wasRecentlyNotified({
            userId: current.userId,
            year: data.year,
            month: data.month,
            currentRank: current.rank,
            timeWindowMinutes: 5,
          });

          if (!wasNotified) {
            lostPositions.push({
              userId: current.userId,
              positionsLost,
              currentPosition: current.rank,
            });
          }
        }
      }

      return lostPositions;
    } catch (error: any) {
      throw new Error(
        `Erro ao encontrar usuários que perderam posições: ${error.message}`
      );
    }
  }

  /**
   * Atualiza a última notificação de perda de posição
   * @param {Object} data - Dados para atualização
   * @param {string} data.userId - ID do usuário
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês
   * @param {number} data.currentRank - Posição atual no ranking
   * @param {Date} data.notifiedAt - Data/hora da notificação
   * @returns {Promise<void>}
   */
  async updateLastPositionLossNotification(data: {
    userId: string;
    year: number;
    month: number;
    currentRank: number;
    notifiedAt: Date;
  }): Promise<void> {
    try {
      const rankRepo = getRepository(UserMonthlyEntryRank);
      await rankRepo.update(
        {
          userId: data.userId,
          year: data.year,
          month: data.month,
        },
        {
          lastPositionLossNotifiedAt: data.notifiedAt,
          lastNotifiedRank: data.currentRank,
        }
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar última notificação: ${error.message}`);
    }
  }

  /**
   * Verifica se o usuário já foi notificado sobre perda de posição recentemente
   * @param {Object} data - Dados para verificação
   * @param {string} data.userId - ID do usuário
   * @param {number} data.year - Ano
   * @param {number} data.month - Mês
   * @param {number} data.currentRank - Posição atual no ranking
   * @param {number} [data.timeWindowMinutes=60] - Janela de tempo em minutos (padrão: 60)
   * @returns {Promise<boolean>} true se já foi notificado recentemente
   */
  async wasRecentlyNotified(data: {
    userId: string;
    year: number;
    month: number;
    currentRank: number;
    timeWindowMinutes?: number;
  }): Promise<boolean> {
    try {
      const rankRepo = getRepository(UserMonthlyEntryRank);
      const rank = await rankRepo.findOne({
        where: {
          userId: data.userId,
          year: data.year,
          month: data.month,
        },
      });

      if (!rank || !rank.lastPositionLossNotifiedAt) {
        return false;
      }

      if (rank.lastNotifiedRank !== data.currentRank) {
        return false;
      }

      const timeWindow = (data.timeWindowMinutes || 60) * 60 * 1000;
      const timeSinceLastNotification =
        Date.now() - rank.lastPositionLossNotifiedAt.getTime();

      return timeSinceLastNotification < timeWindow;
    } catch (error: any) {
      throw new Error(
        `Erro ao verificar notificação recente: ${error.message}`
      );
    }
  }

  /**
   * Calcula o ranking de usuários em um período específico baseado nas autenticações.
   * @param {Date} startTime - Início do período
   * @param {Date} endTime - Fim do período
   * @returns {Promise<{userId: string, totalEntries: number, rank: number}[]>} Lista ranqueada
   */
  private async getRankingForPeriod(
    startTime: Date,
    endTime: Date
  ): Promise<{ userId: string; totalEntries: number; rank: number }[]> {
    try {
      const authRepo = getRepository(Authentication);

      const results = await authRepo
        .createQueryBuilder("auth")
        .select("auth.userId", "userId")
        .addSelect("SUM(auth.entryCount)", "totalEntries")
        .where("auth.loginAt BETWEEN :start AND :end", {
          start: startTime,
          end: endTime,
        })
        .groupBy("auth.userId")
        .orderBy('"totalEntries"', "DESC")
        .getRawMany();

      const ranked: { userId: string; totalEntries: number; rank: number }[] =
        [];
      let currentRank = 1;
      let prevTotal = -1;

      for (const r of results) {
        const totalEntries = parseInt(r.totalEntries) || 0;
        if (totalEntries !== prevTotal) {
          currentRank = ranked.length + 1;
          prevTotal = totalEntries;
        }
        ranked.push({
          userId: r.userId,
          totalEntries,
          rank: currentRank,
        });
      }

      return ranked;
    } catch (error: any) {
      throw new Error(
        `Erro ao calcular ranking para período: ${error.message}`
      );
    }
  }
}
