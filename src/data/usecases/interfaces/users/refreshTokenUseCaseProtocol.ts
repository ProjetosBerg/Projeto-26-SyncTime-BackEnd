export interface RefreshTokenUseCaseProtocol {
  handle(
    data: RefreshTokenUseCaseProtocol.Params
  ): Promise<RefreshTokenUseCaseProtocol.Result>;
}

export namespace RefreshTokenUseCaseProtocol {
  export type Params = {
    refreshToken: string;
  };

  export type Result = {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      login: string;
      email: string;
      sessionId: string;
    };
  };
}
