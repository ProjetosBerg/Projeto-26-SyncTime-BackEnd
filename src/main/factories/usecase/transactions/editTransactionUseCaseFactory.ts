import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { EditTransactionUseCase } from "@/data/usecases/transactions/editTransactionUseCase";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeEditTransactionUseCaseFactory = () => {
  return new EditTransactionUseCase(
    new TransactionRepository(),
    new UserRepository(),
    new CategoryRepository(),
    new MonthlyRecordRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
