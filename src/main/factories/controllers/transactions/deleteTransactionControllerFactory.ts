import { DeleteTransactionController } from "@/presentation/controllers/transactions/deleteTransactionController";
import { makeDeleteTransactionUseCaseFactory } from "../../usecase/transactions/deleteTransactionUseCaseFactory";

export const makeDeleteTransactionControllerFactory = () => {
  return new DeleteTransactionController(makeDeleteTransactionUseCaseFactory());
};
