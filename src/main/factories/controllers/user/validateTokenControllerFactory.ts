import { ValidateTokenController } from "@/presentation/controllers/users/validateTokenController";
import { makeValidateTokenUseCaseFactory } from "../../usecase/users/validateTokenUseCaseFactory";

export const makeValidateTokenControllerFactory = () => {
  return new ValidateTokenController(makeValidateTokenUseCaseFactory());
};
