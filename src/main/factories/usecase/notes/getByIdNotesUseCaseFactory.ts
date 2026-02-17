import { GetByIdNotesUseCase } from "@/data/usecases/notes/getByIdNotesUseCase";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";

export const makeGetByIdNotesUseCaseFactory = () => {
  return new GetByIdNotesUseCase(new NotesRepository());
};
