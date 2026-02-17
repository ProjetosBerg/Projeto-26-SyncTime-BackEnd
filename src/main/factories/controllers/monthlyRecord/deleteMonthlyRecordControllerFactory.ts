import { DeleteMonthlyRecordController } from "@/presentation/controllers/monthlyRecord/deleteMonthlyRecordController";
import { makeDeleteMonthlyRecordUseCaseFactory } from "../../usecase/monthlyRecord/deleteMonthlyRecordUseCaseFactory";

export const makeDeleteMonthlyRecordControllerFactory = () => {
  return new DeleteMonthlyRecordController(
    makeDeleteMonthlyRecordUseCaseFactory()
  );
};
