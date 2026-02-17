import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";

import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import {
  GetInboxUserUseCaseProtocol,
  InboxItem,
} from "../interfaces/users/getInboxUserUseCaseProtocol";

export class GetInboxUserUseCase implements GetInboxUserUseCaseProtocol {
  constructor(
    private readonly notesRepository: NotesRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly routinesRepository: RoutinesRepositoryProtocol,
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol
  ) {}

  private formatPath(type: string, id: string | number): string {
    switch (type) {
      case "note":
        return `/anotacoes`;
      case "category":
        return `/categoria`;
      case "monthly_record":
        return `/relatorios/categoria/relatorio-mesal/${id}`;
      case "routine":
        return `/anotacoes`;
      case "Custom_fields":
        return `/custom-fields`;
      default:
        return "";
    }
  }

  async handle(data: GetInboxUserUseCaseProtocol.Params): Promise<InboxItem[]> {
    try {
      const { userId } = data;

      const [notesRes, categoriesRes, recordsRes, routinesRes, customFields] =
        await Promise.all([
          this.notesRepository.findByUserId({
            userId,
            page: 1,
            limit: 3,
            sortBy: "updated_at",
            order: "DESC",
          }),
          this.categoryRepository.findByUserId({
            userId,
            page: 1,
            limit: 3,
            sortBy: "updated_at",
            order: "DESC",
          }),
          this.monthlyRecordRepository.findAllByUserId({
            userId,
            page: 1,
            limit: 3,
            sortBy: "updated_at",
            order: "DESC",
          }),
          this.routinesRepository.findByUserId({
            userId,
            page: 1,
            limit: 3,
            sortBy: "updated_at",
            order: "DESC",
          }),
          this.customFieldsRepository.findByUserId({
            user_id: userId,
            page: 1,
            limit: 3,
            sortBy: "updated_at",
            order: "DESC",
          }),
        ]);

      const items: InboxItem[] = [];

      // Notes
      notesRes.notes.forEach((note) => {
        items.push({
          id: String(note.id),
          title: note.activity || "Sem título",
          updated_at: note.updated_at as Date,
          path: this.formatPath("note", String(note.category_id)),
          type: "note",
          entityName: "Anotação",
          entityRef: {
            routineId: note.routine_id,
            categoryId: note.category_id,
          },
        });
      });

      // Categories
      categoriesRes.categories.forEach((cat) => {
        items.push({
          id: String(cat.id),
          title: cat.name,
          updated_at: cat.updated_at as Date,
          path: this.formatPath("category", String(cat.id)),
          type: "category",
          entityName: "Categoria",
        });
      });

      // Monthly Records
      recordsRes.records.forEach((record) => {
        items.push({
          id: record.id,
          title: record.title || "Registro mensal",
          updated_at: (() => {
            const d = new Date(record.updated_at);
            d.setDate(d.getDate() - 1);
            d.setHours(d.getHours() + 21);
            return d;
          })(),
          path: this.formatPath("monthly_record", String(record.category_id)),
          type: "monthly_record",
          entityName: "Relatório Mensal",
        });
      });

      // Routines
      routinesRes.routines.forEach((routine) => {
        items.push({
          id: String(routine.id),
          title: routine.type,
          updated_at: routine.updated_at as Date,
          path: this.formatPath("routine", String(routine.id)),
          type: "routine",
          entityName: "Rotina",
        });
      });

      // Custom Fields
      customFields.customFields.forEach((field) => {
        items.push({
          id: String(field.id),
          title: field.label,
          updated_at: field.updated_at as Date,
          path: this.formatPath("Custom_fields", String(field.id)),
          type: "Custom_fields",
          entityName: "Custom Fields",
        });
      });

      items.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      return items.slice(0, 12);
    } catch (error: any) {
      throw new ServerError(`Erro ao carregar inbox: ${error.message}`);
    }
  }
}
