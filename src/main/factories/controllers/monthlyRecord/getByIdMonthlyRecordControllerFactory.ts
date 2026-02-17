import { GetByIdMonthlyRecordController } from "@/presentation/controllers/monthlyRecord/getByIdMonthlyRecordController";
import { makeGetByIdMonthlyRecordUseCaseFactory } from "../../usecase/monthlyRecord/getByIdMonthlyRecordUseCaseFactory";

export const makeGetByIdMonthlyRecordControllerFactory = () => {
  return new GetByIdMonthlyRecordController(
    makeGetByIdMonthlyRecordUseCaseFactory()
  );
};
