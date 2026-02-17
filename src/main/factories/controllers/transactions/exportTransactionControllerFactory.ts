import { makeExportTransactionUseCaseFactory } from "../../usecase/transactions/ExportTransactionUseCaseFactory";
import { ExportTransactionController } from "@/presentation/controllers/transactions/exportTransactionController";

export const makeExportTransactionControllerFactory = () => {
  return new ExportTransactionController(makeExportTransactionUseCaseFactory());
};
