import { GetByUserIdCustomFieldsController } from "@/presentation/controllers/customFields/getByUserIdCustomFieldsController";
import { makeGetByUserIdCustomFieldsUseCaseFactory } from "../../usecase/customFields/getByUserIdCustomFieldsUseCaseFactory";

export const makeGetByUserIdCustomFieldsControllerFactory = () => {
  return new GetByUserIdCustomFieldsController(
    makeGetByUserIdCustomFieldsUseCaseFactory()
  );
};
