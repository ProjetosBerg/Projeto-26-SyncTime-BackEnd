export interface GetPresenceUserProtocol {
  handle(
    data: GetPresenceUserProtocol.Params
  ): Promise<GetPresenceUserProtocol.Result>;
}

export namespace GetPresenceUserProtocol {
  export type Params = {
    userId: string;
    month: number; // 1-12
    year: number; // YYYY
  };

  export type DayData = {
    day: string; // '01', '02', etc.
    present: boolean;
    sessions: number;
  };

  export type Stats = {
    presentDays: number;
    totalSessions: number;
    rate: number; // Porcentagem
  };

  export type Result = {
    presenceData: DayData[];
    stats: Stats;
  };
}
