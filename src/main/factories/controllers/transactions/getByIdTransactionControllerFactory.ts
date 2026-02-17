import { GetByIdTransactionController } from "@/presentation/controllers/transactions/getByIdTransactionController";
import { makeGetByIdTransactionUseCaseFactory } from "../../usecase/transactions/getByIdTransactionUseCaseFactory";

export const makeGetByIdTransactionControllerFactory = () => {
  return new GetByIdTransactionController(
    makeGetByIdTransactionUseCaseFactory()
  );
};
