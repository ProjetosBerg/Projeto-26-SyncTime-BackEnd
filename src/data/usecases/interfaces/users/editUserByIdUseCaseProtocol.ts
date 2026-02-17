import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { UserModel } from "@/domain/models/postgres/UserModel";

export interface EditUserByIdUseCaseProtocol {
  handle(
    data: EditUserByIdUseCaseProtocol.Params
  ): Promise<EditUserByIdUseCaseProtocol.Result>;
}

export namespace EditUserByIdUseCaseProtocol {
  export type Params = {
    id: UserModel["id"];
    name?: UserModel["name"];
    email?: UserModel["email"];
    securityQuestions?: SecurityQuestionModel[];
    bio?: UserModel["bio"];
    imageUrl?: UserModel["imageUrl"];
    publicId?: UserModel["publicId"];
  };
  export type Result = UserModel;
}
