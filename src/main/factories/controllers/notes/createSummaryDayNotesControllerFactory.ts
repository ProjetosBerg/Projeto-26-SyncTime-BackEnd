import { CreateSummaryDayNotesController } from "@/presentation/controllers/notes/createSummaryDayNotesController";
import { makeCreateSummaryDayNotesUseCaseFactory } from "../../usecase/notes/createSummaryDayNotesUseCaseFactory";

export const makeCreateSummaryDayNotesControllerFactory = () => {
  return new CreateSummaryDayNotesController(
    makeCreateSummaryDayNotesUseCaseFactory()
  );
};
