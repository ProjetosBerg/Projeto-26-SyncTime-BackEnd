import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { UserModel } from "@/domain/models/postgres/UserModel";

export interface DeleteUserByIdUseCaseProtocol {
  handle(
    data: DeleteUserByIdUseCaseProtocol.Params
  ): Promise<DeleteUserByIdUseCaseProtocol.Result>;
}

export namespace DeleteUserByIdUseCaseProtocol {
  export type Params = {
    id: UserModel["id"];
  };
  export type Result = {
    message: string;
  };
}
