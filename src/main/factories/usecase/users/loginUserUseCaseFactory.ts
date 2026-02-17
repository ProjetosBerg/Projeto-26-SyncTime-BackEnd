import UserAuth from "@/auth/users/userAuth";
import { LoginUserUseCase } from "@/data/usecases/users/loginUserUseCase";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { UserMonthlyEntryRankRepository } from "@/infra/db/postgres/userMonthlyEntryRankRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeLoginUserUseCaseFactory = () => {
  return new LoginUserUseCase(
    new UserRepository(),
    new UserAuth(),
    new AuthenticationRepository(),
    new UserMonthlyEntryRankRepository(),
    new NotificationRepository()
  );
};
