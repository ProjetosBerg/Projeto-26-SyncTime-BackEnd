import { GetByUserIdTransactionController } from "@/presentation/controllers/transactions/getByUserIdTransactionController";
import { makeGetByUserIdTransactionUseCaseFactory } from "../../usecase/transactions/getByUserIdTransactionUseCaseFactory";

export const makeGetByUserIdTransactionControllerFactory = () => {
  return new GetByUserIdTransactionController(
    makeGetByUserIdTransactionUseCaseFactory()
  );
};
