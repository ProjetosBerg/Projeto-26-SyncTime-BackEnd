export interface GetByUserIdRankUserUseCaseProtocol {
  handle(
    data: GetByUserIdRankUserUseCaseProtocol.Params
  ): Promise<{
    top10: { userId: string; totalEntries: number; rank: number }[];
    myRank:
      | { userId: string; totalEntries: number; rank: number | undefined }
      | undefined;
  }>;
}

export namespace GetByUserIdRankUserUseCaseProtocol {
  export type Params = {
    userId: string;
    year: number;
    month: number;
  };
}
