export interface CreateSummaryDayNotesUseCaseProtocol {
  handle(data: CreateSummaryDayNotesUseCaseProtocol.Params): Promise<string>;
}

export namespace CreateSummaryDayNotesUseCaseProtocol {
  export type Params = {
    date: string;
    userId: string;
    routine_id?: string;
  };
}
