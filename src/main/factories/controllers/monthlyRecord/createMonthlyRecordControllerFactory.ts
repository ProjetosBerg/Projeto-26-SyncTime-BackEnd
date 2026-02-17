import { CreateMonthlyRecordController } from "@/presentation/controllers/monthlyRecord/createMonthlyRecordController";
import { makeCreateMonthlyRecordUseCaseFactory } from "../../usecase/monthlyRecord/createMonthlyRecordUseCaseFactory";

export const makeCreateMonthlyRecordControllerFactory = () => {
  return new CreateMonthlyRecordController(
    makeCreateMonthlyRecordUseCaseFactory()
  );
};
