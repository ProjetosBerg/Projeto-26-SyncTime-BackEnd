import { CreateSummaryDayNotesUseCase } from "@/data/usecases/notes/createSummaryDayNotesUseCase";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";
import { NotificationRepository } from "@/infra/db/postgres/notificationRepository";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeCreateSummaryDayNotesUseCaseFactory = () => {
  return new CreateSummaryDayNotesUseCase(
    new NotesRepository(),
    new RoutinesRepository(),
    new NotificationRepository()
  );
};
