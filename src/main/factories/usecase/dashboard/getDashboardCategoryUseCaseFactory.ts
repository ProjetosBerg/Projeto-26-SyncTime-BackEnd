import { GetDashboardCategoryUseCase } from "@/data/usecases/dashboard/getDashboardCategoryUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { TransactionRepository } from "@/infra/db/postgres/transactionRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeGetDashboardCategoryUseCaseFactory = () => {
  return new GetDashboardCategoryUseCase(
    new UserRepository(),
    new CategoryRepository(),
    new MonthlyRecordRepository(),
    new TransactionRepository(),
    new CustomFieldsRepository(),
    new TransactionCustomFieldRepository()
  );
};
