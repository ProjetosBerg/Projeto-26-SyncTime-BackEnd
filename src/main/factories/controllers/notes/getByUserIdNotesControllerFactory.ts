import { GetByUserIdNotesController } from "@/presentation/controllers/notes/getByUserIdNotesController";
import { makeGetByUserIdNotesUseCaseFactory } from "../../usecase/notes/getByUserIdNotesUseCaseFactory";

export const makeGetByUserIdNotesControllerFactory = () => {
  return new GetByUserIdNotesController(makeGetByUserIdNotesUseCaseFactory());
};
