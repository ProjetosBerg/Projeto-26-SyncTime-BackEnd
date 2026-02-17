import { GetInboxUserController } from "@/presentation/controllers/users/getInboxUserController";
import { makeGetInboxUserUseCaseFactory } from "@/main/factories/usecase/users/getInboxUseCaseFactory";

export const makeGetInboxControllerFactory = () => {
  return new GetInboxUserController(makeGetInboxUserUseCaseFactory());
};
