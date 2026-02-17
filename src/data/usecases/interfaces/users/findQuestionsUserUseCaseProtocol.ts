import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { UserModel } from "@/domain/models/postgres/UserModel";

export interface FindQuestionsUserUseCaseProtocol {
  handle(
    data: FindQuestionsUserUseCaseProtocol.Params
  ): Promise<FindQuestionsUserUseCaseProtocol.Result>;
}

export namespace FindQuestionsUserUseCaseProtocol {
  export type Params = {
    login: UserModel["login"];
  };
  export type Result = {
    securityQuestions: Array<{
      question: SecurityQuestionModel["question"];
    }>;
  };
}
