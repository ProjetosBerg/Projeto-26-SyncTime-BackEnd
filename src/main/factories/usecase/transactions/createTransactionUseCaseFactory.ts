import { CreateTransactionUseCase } from "@/data/usecases/transactions/createTransactionUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";

export const makeCreateTransactionUseCaseFactory = () => {
  return new CreateTransactionUseCase(
    new TransactionRepository(),
    new UserRepository(),
    new CategoryRepository(),
    new MonthlyRecordRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
