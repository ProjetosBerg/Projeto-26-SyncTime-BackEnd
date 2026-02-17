import { EditNotesController } from "@/presentation/controllers/notes/editNotesController";
import { makeEditNotesUseCaseFactory } from "../../usecase/notes/editNotesUseCaseFactory";

export const makeEditNotesControllerFactory = () => {
  return new EditNotesController(makeEditNotesUseCaseFactory());
};
