import { GetByUserIdMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/getByUserIdMonthlyRecordUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";

export const makeGetByUserIdMonthlyRecordUseCaseFactory = () => {
  return new GetByUserIdMonthlyRecordUseCase(
    new MonthlyRecordRepository(),
    new UserRepository()
  );
};
