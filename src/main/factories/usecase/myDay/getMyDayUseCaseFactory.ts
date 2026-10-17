import { GetMyDayUseCase } from "@/data/usecases/myDay/getMyDayUseCase";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";

export const makeGetMyDayUseCaseFactory = () => {
  return new GetMyDayUseCase(new NotesRepository());
};
