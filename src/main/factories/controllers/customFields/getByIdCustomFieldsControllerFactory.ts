import { GetByIdCustomFieldsController } from "@/presentation/controllers/customFields/getByIdCustomFieldsController";
import { makeGetByIdCustomFieldsUseCaseFactory } from "../../usecase/customFields/getByIdCustomFieldsUseCaseFactory";

export const makeGetByIdCustomFieldsControllerFactory = () => {
  return new GetByIdCustomFieldsController(
    makeGetByIdCustomFieldsUseCaseFactory()
  );
};
