export interface LogoutUserUseCaseProtocol {
  handle: (
    data: LogoutUserUseCaseProtocol.Params
  ) => Promise<LogoutUserUseCaseProtocol.Result>;
}

export namespace LogoutUserUseCaseProtocol {
  export type Params = {
    sessionId: string;
  };

  export type Result = {
    message: string;
    sessionId: string;
  };
}
