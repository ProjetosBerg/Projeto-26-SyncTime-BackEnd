import { EditCustomFieldsController } from "@/presentation/controllers/customFields/editCustomFieldsController";
import { makeEditCustomFieldsUseCaseFactory } from "../../usecase/customFields/editCustomFieldsUseCaseFactory";

export const makeEditCustomFieldsControllerFactory = () => {
  return new EditCustomFieldsController(makeEditCustomFieldsUseCaseFactory());
};
