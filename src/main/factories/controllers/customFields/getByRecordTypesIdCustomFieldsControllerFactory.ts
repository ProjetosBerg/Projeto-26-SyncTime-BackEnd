import { GetByRecordTypeIdCustomFieldsController } from "@/presentation/controllers/customFields/getByRecordTypeIdCustomFieldsController";
import { makeGetByRecordTypeIdCustomFieldsUseCaseFactory } from "../../usecase/customFields/getByRecordTypeIdCustomFieldsUseCaseFactory";

export const makeGetByRecordTypeIdCustomFieldsControllerFactory = () => {
  return new GetByRecordTypeIdCustomFieldsController(
    makeGetByRecordTypeIdCustomFieldsUseCaseFactory()
  );
};
