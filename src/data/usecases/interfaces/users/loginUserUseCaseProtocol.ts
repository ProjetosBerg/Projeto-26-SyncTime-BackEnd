import { UserModel } from "@/domain/models/postgres/UserModel";

export interface LoginUserUseCaseProtocol {
  handle(
    data: LoginUserUseCaseProtocol.Params
  ): Promise<LoginUserUseCaseProtocol.Result>;
}

export namespace LoginUserUseCaseProtocol {
  export type Params = {
    login: UserModel["login"];
    password: UserModel["password"];
  };
  export type Result = {
    message: string;
    token: string | null;
    user: {
      id: string;
      name: string;
      login: string;
      email: string;
      sessionId?: string;
    };
  };
}
