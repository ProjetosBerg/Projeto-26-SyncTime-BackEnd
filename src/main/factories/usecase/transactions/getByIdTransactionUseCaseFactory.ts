import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { GetByIdTransactionUseCase } from "@/data/usecases/transactions/getByIdTransactionUseCase";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeGetByIdTransactionUseCaseFactory = () => {
  return new GetByIdTransactionUseCase(
    new TransactionRepository(),
    new UserRepository(),
    new MonthlyRecordRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
