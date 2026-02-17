import { DeleteNotesUseCase } from "@/data/usecases/notes/deleteNotesUseCase";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";

export const makeDeleteNotesUseCaseFactory = () => {
  return new DeleteNotesUseCase(
    new NotesRepository(),
    new NotificationRepository()
  );
};
