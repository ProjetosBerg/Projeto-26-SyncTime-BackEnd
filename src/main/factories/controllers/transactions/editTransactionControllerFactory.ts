import { EditTransactionController } from "@/presentation/controllers/transactions/editTransactionController";
import { makeEditTransactionUseCaseFactory } from "../../usecase/transactions/editTransactionUseCaseFactory";

export const makeEditTransactionControllerFactory = () => {
  return new EditTransactionController(makeEditTransactionUseCaseFactory());
};
