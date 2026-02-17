import { ValidateTokenUseCase } from "@/data/usecases/users/validateTokenUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { UserMonthlyEntryRankRepository } from "@/infra/db/postgres/userMonthlyEntryRankRepository";

export const makeValidateTokenUseCaseFactory = () => {
  return new ValidateTokenUseCase(
    new AuthenticationRepository(),
    new UserMonthlyEntryRankRepository(),
    new NotificationRepository()
  );
};
