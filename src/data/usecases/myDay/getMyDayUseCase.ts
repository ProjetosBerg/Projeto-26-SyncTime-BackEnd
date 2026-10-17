import { ServerError } from "@/data/errors/ServerError";
import { MyDayModel } from "@/domain/models/postgres/MyDayModel";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { GetMyDayUseCaseProtocol } from "../interfaces/myDay/getMyDayUseCaseProtocol";
import { getMyDayValidationSchema } from "../validation/myDay/getMyDayValidationSchema";

export class GetMyDayUseCase implements GetMyDayUseCaseProtocol {
  constructor(private readonly notesRepository: NotesRepositoryProtocol) {}

  async handle(data: GetMyDayUseCaseProtocol.Params): Promise<MyDayModel> {
    try {
      const validatedData = (await getMyDayValidationSchema.validate(data, {
        abortEarly: false,
      })) as GetMyDayUseCaseProtocol.Params;
      const items = await this.notesRepository.findForMyDay(validatedData);
      const completed = items.filter((item) =>
        this.normalizeStatus(item.status).includes("concluid")
      ).length;
      const inProgress = items.filter((item) =>
        this.normalizeStatus(item.status).includes("andamento")
      ).length;
      const pending = Math.max(items.length - completed - inProgress, 0);

      return {
        date: validatedData.date,
        items,
        summary: {
          total: items.length,
          completed,
          inProgress,
          pending,
          completionPercentage:
            items.length === 0
              ? 0
              : Math.round((completed / items.length) * 100),
        },
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha ao carregar Meu Dia: ${errorMessage}`);
    }
  }

  private normalizeStatus(status?: string): string {
    return (status || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
