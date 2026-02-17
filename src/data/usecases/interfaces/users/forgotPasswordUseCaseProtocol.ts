import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { UserModel } from "@/domain/models/postgres/UserModel";

export interface ForgotPasswordUserUseCaseProtocol {
  handle(
    data: ForgotPasswordUserUseCaseProtocol.Params
  ): Promise<ForgotPasswordUserUseCaseProtocol.Result>;
}

export namespace ForgotPasswordUserUseCaseProtocol {
  export type Params = {
    login: UserModel["login"];
    newPassword: UserModel["password"];
    confirmNewPassword: UserModel["password"];
    securityQuestions: Array<{
      question: SecurityQuestionModel["question"];
      answer: SecurityQuestionModel["answer"];
    }>;
  };
  export type Result = {
    message: string;
  };
}
