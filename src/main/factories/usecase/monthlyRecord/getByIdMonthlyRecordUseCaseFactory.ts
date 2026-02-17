import { GetByIdMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/getByIdMonthlyRecordUseCase";
import { UserRepository } from "@/infra/db/postgres/userRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";

export const makeGetByIdMonthlyRecordUseCaseFactory = () => {
  return new GetByIdMonthlyRecordUseCase(
    new MonthlyRecordRepository(),
    new UserRepository()
  );
};
