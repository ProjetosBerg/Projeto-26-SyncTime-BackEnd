import { CreateRecordTypesController } from "@/presentation/controllers/recordTypes/createRecordTypesController";
import { makeCreateRecordTypesUseCaseFactory } from "../../usecase/recordTypes/createRecordTypesUseCaseFactory";

export const makeCreateRecordTypesControllerFactory = () => {
  return new CreateRecordTypesController(makeCreateRecordTypesUseCaseFactory());
};
