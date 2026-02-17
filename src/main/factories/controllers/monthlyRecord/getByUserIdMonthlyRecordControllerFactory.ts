import { GetByUserIdMonthlyRecordController } from "@/presentation/controllers/monthlyRecord/getByUserIdMonthlyRecordController";
import { makeGetByUserIdMonthlyRecordUseCaseFactory } from "../../usecase/monthlyRecord/getByUserIdMonthlyRecordUseCaseFactory";

export const makeGetByUserIdMonthlyRecordControllerFactory = () => {
  return new GetByUserIdMonthlyRecordController(
    makeGetByUserIdMonthlyRecordUseCaseFactory()
  );
};
