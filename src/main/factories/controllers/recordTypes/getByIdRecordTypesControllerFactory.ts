import { GetByIdRecordTypesController } from "@/presentation/controllers/recordTypes/getByIdRecordTypesController";
import { makeGetByIdRecordTypesUseCaseFactory } from "../../usecase/recordTypes/getByIdRecordTypeUseCaseFactory";

export const makeGetByIdRecordTypesControllerFactory = () => {
  return new GetByIdRecordTypesController(
    makeGetByIdRecordTypesUseCaseFactory()
  );
};
