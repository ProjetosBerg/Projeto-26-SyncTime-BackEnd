import { UserModel } from "@/domain/models/postgres/UserModel";
import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";

export interface RegisterUserUseCaseProtocol {
  handle(
    data: RegisterUserUseCaseProtocol.Params
  ): Promise<RegisterUserUseCaseProtocol.Result | undefined>;
}

export namespace RegisterUserUseCaseProtocol {
  export type Params = {
    name: UserModel["name"];
    login: UserModel["login"];
    email: UserModel["email"];
    password: UserModel["password"];
    confirmpassword: string;
    securityQuestions: Array<{
      question: SecurityQuestionModel["question"];
      answer: SecurityQuestionModel["answer"];
    }>;
    imageUrl?: UserModel["imageUrl"];
    publicId?: UserModel["publicId"];
  };
  export type Result = {
    user: UserModel;
    token: string;
  };
}
