// src/infra/db/repositories/AuthenticationRepository.ts
import { Authentication } from "@/domain/entities/postgres/Authentication";
import { Between, getRepository, IsNull } from "typeorm";
import { AuthenticationRepositoryProtocol } from "../interfaces/authenticationRepositoryProtocol";

export class AuthenticationRepository
  implements AuthenticationRepositoryProtocol
{
  constructor() {}

  /**
   * Verifica se o usuário já tem registro de login no dia específico
   * @param {Object} data - Critérios de verificação
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.date - Data para verificar
   * @returns {Promise<boolean>} true se já existe login no dia
   */
  async hasLoginToday(data: { userId: string; date: Date }): Promise<boolean> {
    try {
      const repository = getRepository(Authentication);
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await repository.count({
        where: {
          userId: data.userId,
          loginAt: Between(startOfDay, endOfDay),
        },
      });

      return count > 0;
    } catch (error: any) {
      throw new Error(`Erro ao verificar login do dia: ${error.message}`);
    }
  }

  /**
   * Busca uma sessão ativa (sem logout) para um usuário e sessionId específicos
   * @param {Object} data - Critérios de busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.sessionId - ID da sessão
   * @returns {Promise<Authentication | undefined>} A sessão ativa ou undefined
   */
  async findActiveSession(
    data: AuthenticationRepositoryProtocol.FindActiveSessionParams
  ): Promise<Authentication | undefined> {
    try {
      const repository = getRepository(Authentication);

      const findOptions: any = {
        where: {
          userId: data.userId,
          sessionId: data.sessionId,
          logoutAt: IsNull(),
        },
      };
      if (data?.isOrder) {
        findOptions.order = { createdAt: "DESC" };
      }

      const session = await repository.findOne(findOptions);
      return session || undefined;
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessão ativa: ${error.message}`);
    }
  }

  /**
   * Cria um novo registro de autenticação (login) no banco de dados
   * @param {AuthenticationRepositoryProtocol.CreateParams} data - Os dados da autenticação
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<Authentication | undefined>} O registro de autenticação criado
   */
  async create(
    data: AuthenticationRepositoryProtocol.CreateParams
  ): Promise<Authentication | undefined> {
    try {
      const repository = getRepository(Authentication);
      const newAuth = repository.create({
        userId: data.userId,
        loginAt: data.loginAt || new Date(),
        sessionId: data.sessionId,
        isOffensive: data.isOffensive,
        lastEntryAt: data.loginAt || new Date(),
        entryCount: 1,
      });
      newAuth.setIsOffensive();
      const savedAuth = await repository.save(newAuth);
      return savedAuth;
    } catch (error: any) {
      throw new Error(
        `Erro ao criar registro de autenticação: ${error.message}`
      );
    }
  }

  /**
   * Incrementa o entryCount e atualiza lastEntryAt para uma sessão ativa
   * @param {Object} data - Dados para incremento
   * @param {string} data.userId - ID do usuário
   * @param {string} data.sessionId - ID da sessão
   * @param {Date} data.now - Data/hora atual para lastEntryAt
   * @returns {Promise<Authentication>} O registro atualizado
   */
  async incrementEntryCount(
    data: AuthenticationRepositoryProtocol.IncrementEntryCountParams
  ): Promise<Authentication> {
    try {
      const repository = getRepository(Authentication);
      const auth = await repository.findOne({
        where: {
          userId: data.userId,
          sessionId: data.sessionId,
          logoutAt: IsNull(),
        },
      });
      if (!auth) {
        throw new Error("Sessão ativa não encontrada");
      }
      auth.entryCount += 1;
      auth.lastEntryAt = data.now;
      auth.updatedAt = data.now;
      const updatedAuth = await repository.save(auth);
      return updatedAuth;
    } catch (error: any) {
      throw new Error(`Erro ao incrementar entryCount: ${error.message}`);
    }
  }

  /**
   * Busca uma sessão ativa (sem logout) do dia atual para um usuário
   * @param {Object} data - Critérios de busca
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.date - Data para verificar (usado para filtrar o dia)
   * @returns {Promise<Authentication | undefined>} A sessão ativa de hoje ou undefined
   */
  async findActiveSessionToday(
    data: AuthenticationRepositoryProtocol.GetSessionDurationInDayParams
  ): Promise<Authentication | undefined> {
    try {
      const repository = getRepository(Authentication);
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);

      const session = await repository.findOne({
        where: {
          userId: data.userId,
          loginAt: Between(startOfDay, endOfDay),
          logoutAt: IsNull(),
        },
      });
      return session || undefined;
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessão ativa de hoje: ${error.message}`);
    }
  }

  /**
   * Atualiza o logout de uma sessão de autenticação no banco de dados
   * @param {AuthenticationRepositoryProtocol.UpdateLogoutParams} data - Os dados para atualização
   * @param {string} data.sessionId - ID da sessão (único)
   * @param {Date} [data.logoutAt] - Data/hora do logout (opcional, usa current se não fornecido)
   * @returns {Promise<Authentication | undefined>} O registro de autenticação atualizado
   */
  async updateLogout(
    data: AuthenticationRepositoryProtocol.UpdateLogoutParams
  ): Promise<Authentication | undefined> {
    try {
      const repository = getRepository(Authentication);
      const auth = await repository.findOne({
        where: { sessionId: data.sessionId },
        order: { createdAt: "DESC" },
      });
      if (!auth) {
        throw new Error("Sessão de autenticação não encontrada");
      }
      auth.logoutAt = data.logoutAt || new Date();
      auth.updatedAt = new Date();
      const updatedAuth = await repository.save(auth);
      return updatedAuth;
    } catch (error: any) {
      throw new Error(
        `Erro ao atualizar logout de autenticação: ${error.message}`
      );
    }
  }

  /**
   * Busca registros de autenticação por usuário e período (para relatórios de presença/ofensiva)
   * @param {AuthenticationRepositoryProtocol.FindByUserAndPeriodParams} data - Critérios de busca
   * @param {string} data.userId - ID do usuário
   * @param {Date} [data.startDate] - Data inicial (opcional)
   * @param {Date} [data.endDate] - Data final (opcional)
   * @param {boolean} [data.onlyOffensive] - Filtrar apenas logins ofensivos (opcional)
   * @returns {Promise<Authentication[]>} Lista de registros de autenticação
   */
  async findByUserAndPeriod(
    data: AuthenticationRepositoryProtocol.FindByUserAndPeriodParams
  ): Promise<Authentication[]> {
    try {
      const repository = getRepository(Authentication);
      const whereClause: any = { userId: data.userId };
      if (data.startDate && data.endDate) {
        whereClause.loginAt = Between(data.startDate, data.endDate);
      }
      if (data.onlyOffensive !== undefined) {
        whereClause.isOffensive = data.onlyOffensive;
      }
      const auths = await repository.find({
        where: whereClause,
        order: { loginAt: "ASC" },
      });
      return auths;
    } catch (error: any) {
      throw new Error(`Erro ao buscar autenticações: ${error.message}`);
    }
  }

  /**
   * Conta o número de sessões (logins) por dia para um usuário
   * @param {AuthenticationRepositoryProtocol.CountSessionsByDayParams} data - Critérios de contagem
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.date - Data específica do dia
   * @returns {Promise<number>} Número de sessões no dia
   */
  async countSessionsByDay(
    data: AuthenticationRepositoryProtocol.CountSessionsByDayParams
  ): Promise<number> {
    try {
      const repository = getRepository(Authentication);
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);
      const count = await repository.count({
        where: {
          userId: data.userId,
          loginAt: Between(startOfDay, endOfDay),
        },
      });
      return count;
    } catch (error: any) {
      throw new Error(`Erro ao contar sessões: ${error.message}`);
    }
  }

  /**
   * Soma o total de entradas (entryCount) no dia para um usuário (útil para contagem total de acessos/entradas no dia)
   * @param {Object} data - Critérios de soma
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.date - Data específica do dia
   * @returns {Promise<number>} Total de entradas no dia (soma de entryCount das sessões iniciadas no dia)
   */
  async getTotalEntriesInDay(
    data: AuthenticationRepositoryProtocol.GetTotalEntriesInDayParams
  ): Promise<number> {
    try {
      const repository = getRepository(Authentication);
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);

      const auths = await repository.find({
        where: {
          userId: data.userId,
          loginAt: Between(startOfDay, endOfDay),
        },
      });

      return auths.reduce((total, auth) => total + auth.entryCount, 0);
    } catch (error: any) {
      throw new Error(`Erro ao somar entradas do dia: ${error.message}`);
    }
  }

  /**
   * Verifica se existe um login ofensivo no dia para streak/ofensiva
   * @param {AuthenticationRepositoryProtocol.HasOffensiveLoginParams} data - Critérios de verificação
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.date - Data específica do dia
   * @returns {Promise<boolean>} true se há pelo menos um login ofensivo no dia
   */
  async hasOffensiveLoginInDay(
    data: AuthenticationRepositoryProtocol.HasOffensiveLoginInDayParams
  ): Promise<boolean> {
    try {
      const repository = getRepository(Authentication);
      const startOfDay = new Date(data.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.date);
      endOfDay.setHours(23, 59, 59, 999);
      const count = await repository.count({
        where: {
          userId: data.userId,
          loginAt: Between(startOfDay, endOfDay),
          isOffensive: true,
        },
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(`Erro ao verificar login ofensivo: ${error.message}`);
    }
  }
}
