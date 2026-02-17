import { DeleteRecordTypesController } from "@/presentation/controllers/recordTypes/deleteRecordTypesController";
import { makeDeleteRecordTypesUseCaseFactory } from "@/main/factories/usecase/recordTypes/deleteRecordTypesUseCaseFactory";

export const makeDeleteRecordTypesControllerFactory = () => {
  return new DeleteRecordTypesController(makeDeleteRecordTypesUseCaseFactory());
};
