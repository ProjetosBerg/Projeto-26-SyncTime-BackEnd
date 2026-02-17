import { CreateNotesUseCase } from "@/data/usecases/notes/createNotesUseCase";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeCreateNotesUseCaseFactory = () => {
  return new CreateNotesUseCase(
    new NotesRepository(),
    new RoutinesRepository(),
    new CategoryRepository(),
    new NotificationRepository()
  );
};
