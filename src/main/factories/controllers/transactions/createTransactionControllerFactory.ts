import { CreateTransactionController } from "@/presentation/controllers/transactions/createTransactionController";
import { makeCreateTransactionUseCaseFactory } from "../../usecase/transactions/createTransactionUseCaseFactory";

export const makeCreateTransactionControllerFactory = () => {
  return new CreateTransactionController(makeCreateTransactionUseCaseFactory());
};
