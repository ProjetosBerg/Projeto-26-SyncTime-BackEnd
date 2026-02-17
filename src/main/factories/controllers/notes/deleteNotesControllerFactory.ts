import { DeleteNotesController } from "@/presentation/controllers/notes/deleteNotesController";
import { makeDeleteNotesUseCaseFactory } from "../../usecase/notes/deleteNotesUseCaseFactory";

export const makeDeleteNotesControllerFactory = () => {
  return new DeleteNotesController(makeDeleteNotesUseCaseFactory());
};
