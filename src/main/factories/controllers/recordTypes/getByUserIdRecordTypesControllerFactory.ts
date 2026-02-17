import { GetByUserIdRecordTypesController } from "@/presentation/controllers/recordTypes/getByUserIdRecordTypesController";
import { makeGetByUserIdRecordTypesUseCaseFactory } from "../../usecase/recordTypes/getByUserIdRecordTypeUseCaseFactory";

export const makeGetByUserIdRecordTypesControllerFactory = () => {
  return new GetByUserIdRecordTypesController(
    makeGetByUserIdRecordTypesUseCaseFactory()
  );
};
