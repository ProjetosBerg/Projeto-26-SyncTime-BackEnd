import { RefreshTokenController } from "@/presentation/controllers/users/refreshTokenController";
import { makeRefreshTokenUseCaseFactory } from "../../usecase/users/refreshTokenUseCaseFactory";

export const makeRefreshTokenControllerFactory = (): RefreshTokenController =>
  new RefreshTokenController(makeRefreshTokenUseCaseFactory());
