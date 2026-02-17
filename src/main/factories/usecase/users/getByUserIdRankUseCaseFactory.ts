import { GetByUserIdRankUserUseCase } from "@/data/usecases/users/getByUserIdRankUserUseCase";
import { UserMonthlyEntryRankRepository } from "@/infra/db/postgres/userMonthlyEntryRankRepository";

export const makeGetByUserIdRankUseCaseFactory = () => {
  return new GetByUserIdRankUserUseCase(new UserMonthlyEntryRankRepository());
};
