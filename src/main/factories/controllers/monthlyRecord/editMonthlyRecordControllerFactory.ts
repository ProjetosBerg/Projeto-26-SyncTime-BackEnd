import { EditMonthlyRecordController } from "@/presentation/controllers/monthlyRecord/editMonthlyRecordController";
import { makeEditMonthlyRecordUseCaseFactory } from "../../usecase/monthlyRecord/editMonthlyRecordUseCaseFactory";

export const makeEditMonthlyRecordControllerFactory = () => {
  return new EditMonthlyRecordController(makeEditMonthlyRecordUseCaseFactory());
};
