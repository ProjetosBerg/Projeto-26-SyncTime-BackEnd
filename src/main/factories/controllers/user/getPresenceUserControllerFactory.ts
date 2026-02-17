import { GetPresenceUserController } from "@/presentation/controllers/users/getPresenceUserController";
import { makeGetPresenceUserUseCaseFactory } from "../../usecase/users/getPresenceUseCaseFactory";

export const makeGetPresenceUserControllerFactory = () => {
  return new GetPresenceUserController(makeGetPresenceUserUseCaseFactory());
};
