import { EditMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/editMonthlyRecordUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeEditMonthlyRecordUseCaseFactory = () => {
  return new EditMonthlyRecordUseCase(
    new MonthlyRecordRepository(),
    new UserRepository(),
    new CategoryRepository(),
    new NotificationRepository()
  );
};
