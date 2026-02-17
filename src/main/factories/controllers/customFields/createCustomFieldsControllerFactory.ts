import { CreateCustomFieldsController } from "@/presentation/controllers/customFields/createCustomFieldsController";
import { makeCreateCustomFieldsUseCaseFactory } from "../../usecase/customFields/createCustomFieldsUseCaseFactory";

export const makeCreateCustomFieldsControllerFactory = () => {
  return new CreateCustomFieldsController(
    makeCreateCustomFieldsUseCaseFactory()
  );
};
