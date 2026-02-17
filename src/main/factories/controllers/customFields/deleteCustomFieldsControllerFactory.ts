import { DeleteCustomFieldsController } from "@/presentation/controllers/customFields/deleteCustomFieldsController";
import { makeDeleteCustomFieldsUseCaseFactory } from "../../usecase/customFields/deleteCustomFieldsUseCaseFactory";

export const makeDeleteCustomFieldsControllerFactory = () => {
  return new DeleteCustomFieldsController(
    makeDeleteCustomFieldsUseCaseFactory()
  );
};
