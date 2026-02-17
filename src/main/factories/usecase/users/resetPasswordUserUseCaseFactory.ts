import UserAuth from "@/auth/users/userAuth";
import { ResetPasswordUserUseCase } from "@/data/usecases/users/resetPasswordUserUseCase";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeResetPasswordUserUseCaseFactory = () => {
  return new ResetPasswordUserUseCase(
    new UserRepository(),
    new UserAuth(),
    new NotificationRepository()
  );
};
