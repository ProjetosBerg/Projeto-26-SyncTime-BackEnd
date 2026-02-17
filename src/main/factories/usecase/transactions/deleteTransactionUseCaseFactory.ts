import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { DeleteTransactionUseCase } from "@/data/usecases/transactions/deleteTransactionUseCase";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeDeleteTransactionUseCaseFactory = () => {
  return new DeleteTransactionUseCase(
    new TransactionRepository(),
    new UserRepository(),
    new MonthlyRecordRepository(),
    new TransactionCustomFieldRepository()
  );
};
