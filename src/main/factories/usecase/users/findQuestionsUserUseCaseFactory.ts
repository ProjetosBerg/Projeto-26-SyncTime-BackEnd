import { FindQuestionsUserUseCase } from "@/data/usecases/users/findQuestionsUserUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeFindQuestionsUserUseCaseFactory = () => {
  return new FindQuestionsUserUseCase(new UserRepository());
};
