import UserAuth from "@/auth/users/userAuth";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";
import { GetUserLogin } from "@/presentation/middlewares/getUserLogin";

export const makeGetLoginMiddleware = () => {
  return new GetUserLogin(new UserAuth(), new AuthenticationRepository());
};
