import { GetByIdNotesController } from "@/presentation/controllers/notes/getByIdNotesController";
import { makeGetByIdNotesUseCaseFactory } from "../../usecase/notes/getByIdNotesUseCaseFactory";

export const makeGetByIdNotesControllerFactory = () => {
  return new GetByIdNotesController(makeGetByIdNotesUseCaseFactory());
};
