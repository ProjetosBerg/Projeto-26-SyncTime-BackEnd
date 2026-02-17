import { EditRecordTypesController } from "@/presentation/controllers/recordTypes/editRecordTypesController";
import { makeEditRecordTypesUseCaseFactory } from "../../usecase/recordTypes/editRecordTypesUseCaseFactory";

export const makeEditRecordTypesControllerFactory = () => {
  return new EditRecordTypesController(makeEditRecordTypesUseCaseFactory());
};
