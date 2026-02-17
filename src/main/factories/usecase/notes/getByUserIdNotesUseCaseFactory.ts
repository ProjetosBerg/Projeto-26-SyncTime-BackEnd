import { GetByUserIdNotesUseCase } from "@/data/usecases/notes/getByUserIdNotesUseCase";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";

export const makeGetByUserIdNotesUseCaseFactory = () => {
  return new GetByUserIdNotesUseCase(new NotesRepository());
};
