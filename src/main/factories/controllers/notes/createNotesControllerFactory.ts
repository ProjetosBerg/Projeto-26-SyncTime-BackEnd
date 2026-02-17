import { CreateNotesController } from "@/presentation/controllers/notes/createNotesController";
import { makeCreateNotesUseCaseFactory } from "../../usecase/notes/createNotesUseCaseFactory";

export const makeCreateNotesControllerFactory = () => {
  return new CreateNotesController(makeCreateNotesUseCaseFactory());
};
