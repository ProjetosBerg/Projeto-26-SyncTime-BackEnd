export interface ValidateTokenUseCaseProtocol {
  handle: (
    data: ValidateTokenUseCaseProtocol.Params
  ) => Promise<ValidateTokenUseCaseProtocol.Result>;
}

export namespace ValidateTokenUseCaseProtocol {
  export type Params = {
    userId: string;
    sessionId?: string;
  };

  export type Result = {
    valid: true;
    sessionId: string;
  };
}
