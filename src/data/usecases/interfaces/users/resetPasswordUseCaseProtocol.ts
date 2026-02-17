import { UserModel } from "@/domain/models/postgres/UserModel";

export interface ResetPasswordUserUseCaseProtocol {
  handle(
    data: ResetPasswordUserUseCaseProtocol.Params
  ): Promise<ResetPasswordUserUseCaseProtocol.Result>;
}

export namespace ResetPasswordUserUseCaseProtocol {
  export type Params = {
    login: UserModel["login"];
    oldPassword: UserModel["password"];
    newPassword: UserModel["password"];
    confirmNewPassword: UserModel["password"];
  };
  export type Result = {
    message: string;
  };
}
