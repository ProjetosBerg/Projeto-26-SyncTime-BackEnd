import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { GetByUserIdTransactionUseCase } from "@/data/usecases/transactions/getByUserIdTransactionUseCase";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";

export const makeGetByUserIdTransactionUseCaseFactory = () => {
  return new GetByUserIdTransactionUseCase(
    new TransactionRepository(),
    new UserRepository(),
    new MonthlyRecordRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository(),
    new CategoryRepository()
  );
};
