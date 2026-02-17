export interface GetStreakUserProtocol {
  handle(
    data: GetStreakUserProtocol.Params
  ): Promise<GetStreakUserProtocol.Result>;
}

export namespace GetStreakUserProtocol {
  export type Params = {
    userId: string;
  };

  export type Result = {
    streakDays: number;
    weekProgress: boolean[];
    completedDaysThisWeek: number;
  };
}
