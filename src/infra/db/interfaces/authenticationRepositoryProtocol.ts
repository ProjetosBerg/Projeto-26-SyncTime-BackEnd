// src/infra/db/interfaces/authenticationRepositoryProtocol.ts
import { Authentication } from "@/domain/entities/postgres/Authentication";

export interface AuthenticationRepositoryProtocol {
  /**
   * Verifica se usuário já logou hoje
   */
  hasLoginToday(data: { userId: string; date: Date }): Promise<boolean>;

  /**
   * Busca uma sessão ativa (sem logout)
   */
  findActiveSession(
    data: AuthenticationRepositoryProtocol.FindActiveSessionParams
  ): Promise<Authentication | undefined>;

  /**
   * Cria um novo registro de autenticação
   */
  create(
    data: AuthenticationRepositoryProtocol.CreateParams
  ): Promise<Authentication | undefined>;

  /**
   * Incrementa o entryCount e atualiza lastEntryAt para uma sessão ativa
   */
  incrementEntryCount(
    data: AuthenticationRepositoryProtocol.IncrementEntryCountParams
  ): Promise<Authentication>;

  /**
   * Atualiza o logout de uma sessão
   */
  updateLogout(
    data: AuthenticationRepositoryProtocol.UpdateLogoutParams
  ): Promise<Authentication | undefined>;

  /**
   * Busca autenticações por usuário e período
   */
  findByUserAndPeriod(
    data: AuthenticationRepositoryProtocol.FindByUserAndPeriodParams
  ): Promise<Authentication[]>;

  /**
   * Conta sessões por dia
   */
  countSessionsByDay(
    data: AuthenticationRepositoryProtocol.CountSessionsByDayParams
  ): Promise<number>;

  /**
   * Soma o total de entradas (entryCount) no dia para um usuário
   */
  getTotalEntriesInDay(
    data: AuthenticationRepositoryProtocol.GetTotalEntriesInDayParams
  ): Promise<number>;

  /**
   * Verifica se há login ofensivo no dia
   */
  hasOffensiveLoginInDay(
    data: AuthenticationRepositoryProtocol.HasOffensiveLoginInDayParams
  ): Promise<boolean>;

  findActiveSessionToday(
    data: AuthenticationRepositoryProtocol.GetSessionDurationInDayParams
  ): Promise<Authentication | undefined>;
}

export namespace AuthenticationRepositoryProtocol {
  export type CreateParams = {
    userId: string;
    loginAt?: Date;
    sessionId: string;
    isOffensive: boolean;
  };

  export type UpdateLogoutParams = {
    sessionId: string;
    logoutAt?: Date;
  };

  export type FindByUserAndPeriodParams = {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    onlyOffensive?: boolean;
  };

  export type CountSessionsByDayParams = {
    userId: string;
    date: Date;
  };

  export type HasOffensiveLoginInDayParams = {
    userId: string;
    date: Date;
  };

  export type GetTotalEntriesInDayParams = {
    userId: string;
    date: Date;
  };

  export type GetSessionDurationInDayParams = {
    userId: string;
    date: Date;
  };

  export type IncrementEntryCountParams = {
    userId: string;
    sessionId: string;
    now: Date;
  };

  export type FindActiveSessionParams = {
    userId: string;
    sessionId: string;
    isOrder?: boolean;
  };
}
