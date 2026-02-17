import { GetInboxUserUseCase } from "@/data/usecases/users/getInboxUserUseCase";
import { CustomFieldsRepository } from "@/infra/db/mongo/customFieldsRepository";
import { CategoryRepository } from "@/infra/db/postgres/categoryRepository";
import { MonthlyRecordRepository } from "@/infra/db/postgres/monthlyRecordRepository";
import { NotesRepository } from "@/infra/db/postgres/notesRepository";
import { RoutinesRepository } from "@/infra/db/postgres/routinesRepository";

export const makeGetInboxUserUseCaseFactory = () => {
  return new GetInboxUserUseCase(
    new NotesRepository(),
    new CategoryRepository(),
    new MonthlyRecordRepository(),
    new RoutinesRepository(),
    new CustomFieldsRepository()
  );
};
