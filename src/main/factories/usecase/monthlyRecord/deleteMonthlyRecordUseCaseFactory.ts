import { DeleteMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/deleteMonthlyRecordyUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { TransactionCustomFieldRepository } from "@/infra/db/mongo/transactionCustomFieldsRepository";

export const makeDeleteMonthlyRecordUseCaseFactory = () => {
  return new DeleteMonthlyRecordUseCase(
    new MonthlyRecordRepository(),
    new UserRepository(),
    new NotificationRepository(),
    new TransactionCustomFieldRepository()
  );
};
