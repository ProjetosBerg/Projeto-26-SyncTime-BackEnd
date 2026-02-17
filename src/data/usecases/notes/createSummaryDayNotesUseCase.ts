import { ServerError } from "@/data/errors/ServerError";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { CreateSummaryDayNotesUseCaseProtocol } from "../interfaces/notes/createSummaryDayNotesUseCaseProtocol";
import { createSummaryDayNotesValidationSchema } from "../validation/notes/createSummaryDayNotesValidationSchema";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

interface TimeSlot {
  label: string;
  emoji: string;
  start: number;
  end: number;
}

export class CreateSummaryDayNotesUseCase
  implements CreateSummaryDayNotesUseCaseProtocol
{
  private readonly TIME_SLOTS: TimeSlot[] = [
    { label: "Madrugada", emoji: "🌙", start: 0, end: 6 },
    { label: "Manhã", emoji: "🌅", start: 6, end: 12 },
    { label: "Tarde", emoji: "☀️", start: 12, end: 18 },
    { label: "Noite", emoji: "🌆", start: 18, end: 24 },
  ];

  constructor(
    private readonly notesRepository: NotesRepositoryProtocol,
    private readonly routinesRepository: RoutinesRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: CreateSummaryDayNotesUseCaseProtocol.Params
  ): Promise<string> {
    try {
      const validatedData =
        await createSummaryDayNotesValidationSchema.validate(data, {
          abortEarly: false,
        });

      if (!validatedData) {
        throw new ServerError("Dados inválidos para criação do resumo do dia.");
      }

      const { notes } = await this.notesRepository.findByUserIdAndDate({
        userId: validatedData.userId,
        date: validatedData.date,
      });

      if (notes.length === 0) {
        return "Nenhuma nota encontrada para esta data.";
      }

      const summary = this.generateModernSummary(notes, validatedData.date);

      let routineId = validatedData.routine_id;
      let routineModel;
      if (!routineId) {
        const { routines } = await this.routinesRepository.findByUserId({
          userId: validatedData.userId,
          page: 1,
          limit: 1,
        });
        if (routines.length === 0) {
          throw new ServerError(
            "Nenhuma rotina encontrada para este usuário. Crie uma rotina antes de gerar resumos."
          );
        }
        routineId = routines[0].id;
        routineModel = routines[0];
      }

      const dateParts = validatedData.date.split("-");
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const localDate = new Date(year, month, day);
      const formattedDate = localDate.toLocaleDateString("pt-BR");

      const existingSummary =
        await this.notesRepository.findByUserIdAndSummaryDate({
          userId: validatedData.userId,
          formattedDate,
        });

      if (existingSummary) {
        await this.notesRepository.deleteNote({
          id: existingSummary.id,
          userId: validatedData.userId,
        });
      }

      const summaryNote = await this.notesRepository.create({
        activity: `Resumo do Dia - ${formattedDate}`,
        description: `Resumo estruturado das atividades do dia ${formattedDate}.`,
        summaryDay: summary,
        routine_id: routineId,
        userId: validatedData.userId,
        status: "",
        priority: "",
      });

      const newNotification = await this.notificationRepository.create({
        title: `Resumo do dia gerado: ${formattedDate}`,
        entity: "Anotação",
        idEntity: summaryNote.id,
        userId: validatedData.userId,
        path: `/anotacoes`,
        payload: {
          date: validatedData.date,
          formattedDate: formattedDate,
          routine_id: routineId,
          totalNotes: notes.length,
          summaryPreview: summary.substring(0, 200) + "...",
          summary: summary,
          routines: routineModel,
        } as NotificationModel["payload"],
        typeOfAction: "Criação",
      });

      const countNewNotification =
        await this.notificationRepository.countNewByUserId({
          userId: validatedData.userId,
        });

      const io = getIo();
      const now = new Date();
      if (io && newNotification) {
        const notificationData = {
          id: newNotification.id,
          title: newNotification.title,
          entity: newNotification.entity,
          idEntity: newNotification.idEntity,
          path: newNotification.path,
          typeOfAction: newNotification.typeOfAction,
          payload: newNotification.payload,
          createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          countNewNotification,
        };

        io.to(`user_${validatedData.userId}`).emit(
          "newNotification",
          notificationData
        );
        logger.info(
          `Notificação de resumo do dia emitida via Socket.IO para userId: ${validatedData.userId} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado ou notificação nula → resumo gerado, mas sem push em tempo real"
        );
      }

      return summary;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a geração do resumo";
      throw new ServerError(
        `Falha na criação do resumo do dia: ${errorMessage}`
      );
    }
  }

  private generateModernSummary(notes: any[], date: string): string {
    const dateParts = date.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const localDate = new Date(year, month, day);
    const formattedDate = localDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const metrics = this.calculateMetrics(notes);

    const notesByPeriod = this.organizeNotesByPeriod(notes);

    let summary = ``;

    summary += this.generateMetricsDashboard(metrics);
    summary += `\n---\n\n`;

    summary += `# ⏰ Linha do Tempo\n\n`;

    this.TIME_SLOTS.forEach((slot) => {
      const periodNotes = notesByPeriod[slot.label] || [];
      if (periodNotes.length > 0) {
        summary += this.generatePeriodSection(slot, periodNotes);
      }
    });

    summary += `---\n\n`;

    summary += this.generateUncompletedActivities(notes);
    summary += `\n---\n\n`;

    summary += this.generateInsights(notes, metrics);

    return summary;
  }

  private calculateMetrics(notes: any[]) {
    const total = notes.length;
    const completed = notes.filter((n) =>
      n.status?.toLowerCase().includes("concluído")
    ).length;
    const inProgress = notes.filter((n) =>
      n.status?.toLowerCase().includes("em andamento")
    ).length;
    const notStarted = notes.filter((n) =>
      n.status?.toLowerCase().includes("não realizado")
    ).length;

    const urgent = notes.filter((n) =>
      n.priority?.toLowerCase().includes("urgente")
    ).length;
    const high = notes.filter((n) =>
      n.priority?.toLowerCase().includes("alta")
    ).length;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const withCollaborators = notes.filter(
      (n) => n.collaborators && n.collaborators.length > 0
    ).length;

    let totalMinutes = 0;
    notes.forEach((note) => {
      if (note.startTime && note.endTime) {
        const start = this.timeToMinutes(note.startTime);
        const end = this.timeToMinutes(note.endTime);
        totalMinutes += end - start;
      }
    });

    return {
      total,
      completed,
      inProgress,
      notStarted,
      urgent,
      high,
      completionRate,
      withCollaborators,
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private getTimeSlotForNote(note: any): string {
    if (!note.startTime) return "Noite"; // Default

    const hour = parseInt(note.startTime.split(":")[0]);
    const slot = this.TIME_SLOTS.find((s) => hour >= s.start && hour < s.end);
    return slot ? slot.label : "Noite";
  }

  private organizeNotesByPeriod(notes: any[]) {
    const organized: { [key: string]: any[] } = {};

    notes.forEach((note) => {
      const period = this.getTimeSlotForNote(note);
      if (!organized[period]) {
        organized[period] = [];
      }
      organized[period].push(note);
    });

    Object.keys(organized).forEach((period) => {
      organized[period].sort((a, b) => {
        const timeA = a.startTime || "00:00:00";
        const timeB = b.startTime || "00:00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return organized;
  }

  private generateMetricsDashboard(metrics: any): string {
    let dashboard = `## 📊 Visão Geral\n\n`;

    dashboard += `| Métrica | Valor |\n`;
    dashboard += `|---------|-------|\n`;
    dashboard += `| 📝 **Total de Atividades** | ${metrics.total} |\n`;
    dashboard += `| ✅ **Concluídas** | ${metrics.completed} (${metrics.completionRate}%) |\n`;
    dashboard += `| ⏳ **Em Andamento** | ${metrics.inProgress} |\n`;
    dashboard += `| ❌ **Não Realizadas** | ${metrics.notStarted} |\n`;
    dashboard += `| 🔴 **Alta Prioridade** | ${metrics.high + metrics.urgent} |\n`;
    dashboard += `| 👥 **Com Colaboradores** | ${metrics.withCollaborators} |\n`;
    dashboard += `| ⏱️ **Tempo Total** | ${metrics.totalHours}h ${metrics.totalMinutes}min |\n\n`;

    const productivityEmoji =
      metrics.completionRate >= 80
        ? "🔥"
        : metrics.completionRate >= 60
          ? "💪"
          : metrics.completionRate >= 40
            ? "⚡"
            : "📊";

    dashboard += `### ${productivityEmoji} Indicador de Produtividade\n\n`;
    dashboard += this.generateProgressBar(metrics.completionRate);
    dashboard += `\n`;

    if (metrics.completionRate >= 80) {
      dashboard += `> 🎉 **Excelente desempenho!** Você está arrasando hoje!\n\n`;
    } else if (metrics.completionRate >= 60) {
      dashboard += `> 💪 **Bom trabalho!** Continue mantendo o ritmo.\n\n`;
    } else if (metrics.completionRate >= 40) {
      dashboard += `> ⚡ **Progresso consistente.** Foco nas prioridades!\n\n`;
    } else {
      dashboard += `> 📊 **Dia em desenvolvimento.** Cada passo conta!\n\n`;
    }

    return dashboard;
  }

  private generateProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `\`${bar}\` **${percentage}%**\n`;
  }

  private generateUncompletedActivities(notes: any[]): string {
    const uncompletedNotes = notes.filter(
      (note) => !note.status?.toLowerCase().includes("concluído")
    );

    if (uncompletedNotes.length === 0) {
      return `# ✅ Atividades Pendentes\n\n> 🎉 **Parabéns!** Todas as atividades foram concluídas hoje!\n`;
    }

    let section = `# ⚠️ Atividades Pendentes\n\n`;
    section += `*${uncompletedNotes.length} ${uncompletedNotes.length === 1 ? "atividade não concluída" : "atividades não concluídas"}*\n\n`;

    const urgentNotes = uncompletedNotes.filter((n) =>
      n.priority?.toLowerCase().includes("urgente")
    );
    const highNotes = uncompletedNotes.filter((n) =>
      n.priority?.toLowerCase().includes("alta")
    );
    const mediumNotes = uncompletedNotes.filter((n) =>
      n.priority?.toLowerCase().includes("média")
    );
    const lowNotes = uncompletedNotes.filter(
      (n) =>
        n.priority?.toLowerCase().includes("baixa") ||
        !n.priority ||
        n.priority === ""
    );

    if (urgentNotes.length > 0) {
      section += `## 🚨 Prioridade Urgente\n\n`;
      urgentNotes.forEach((note) => {
        section += this.generateUncompletedNoteItem(note);
      });
      section += `\n`;
    }

    if (highNotes.length > 0) {
      section += `## 🔴 Prioridade Alta\n\n`;
      highNotes.forEach((note) => {
        section += this.generateUncompletedNoteItem(note);
      });
      section += `\n`;
    }

    if (mediumNotes.length > 0) {
      section += `## 🟡 Prioridade Média\n\n`;
      mediumNotes.forEach((note) => {
        section += this.generateUncompletedNoteItem(note);
      });
      section += `\n`;
    }

    if (lowNotes.length > 0) {
      section += `## 🟢 Prioridade Baixa / Sem Prioridade\n\n`;
      lowNotes.forEach((note) => {
        section += this.generateUncompletedNoteItem(note);
      });
      section += `\n`;
    }

    return section;
  }

  private generateUncompletedNoteItem(note: any): string {
    const statusEmoji = this.getStatusEmoji(note.status);
    const timeRange = note.startTime
      ? `${note.startTime.substring(0, 5)} → ${note.endTime?.substring(0, 5) || "—"}`
      : "Sem horário definido";

    let item = `### ${statusEmoji} ${note.activity}\n`;
    item += `**⏰ ${timeRange}** · 📍 ${note.activityType || "Não especificado"}\n\n`;

    if (note.description) {
      item += `📝 ${note.description}\n\n`;
    }

    if (note.collaborators && note.collaborators.length > 0) {
      item += `👥 **Colaboradores:** ${note.collaborators.join(", ")}\n\n`;
    }

    return item;
  }

  private generatePeriodSection(slot: TimeSlot, notes: any[]): string {
    let section = `## ${slot.emoji} ${slot.label}\n`;
    section += `*${notes.length} ${notes.length === 1 ? "atividade" : "atividades"}*\n\n`;

    const completedNotes = notes.filter((n) =>
      n.status?.toLowerCase().includes("concluído")
    );
    const inProgressNotes = notes.filter((n) =>
      n.status?.toLowerCase().includes("em andamento")
    );
    const notStartedNotes = notes.filter((n) =>
      n.status?.toLowerCase().includes("não realizado")
    );
    const otherNotes = notes.filter(
      (n) =>
        !n.status ||
        (!n.status.toLowerCase().includes("concluído") &&
          !n.status.toLowerCase().includes("em andamento") &&
          !n.status.toLowerCase().includes("não realizado"))
    );

    if (completedNotes.length > 0) {
      section += `### ✅ Concluídas (${completedNotes.length})\n\n`;
      completedNotes.forEach((note) => {
        section += this.generateNoteItem(note);
      });
      section += `\n`;
    }

    if (inProgressNotes.length > 0) {
      section += `### ⏳ Em Andamento (${inProgressNotes.length})\n\n`;
      inProgressNotes.forEach((note) => {
        section += this.generateNoteItem(note);
      });
      section += `\n`;
    }

    if (notStartedNotes.length > 0) {
      section += `### ❌ Não Realizadas (${notStartedNotes.length})\n\n`;
      notStartedNotes.forEach((note) => {
        section += this.generateNoteItem(note);
      });
      section += `\n`;
    }

    if (otherNotes.length > 0) {
      section += `### 📝 Outras (${otherNotes.length})\n\n`;
      otherNotes.forEach((note) => {
        section += this.generateNoteItem(note);
      });
      section += `\n`;
    }

    return section;
  }

  private generateNoteItem(note: any): string {
    const statusEmoji = this.getStatusEmoji(note.status);
    const priorityEmoji = this.getPriorityEmoji(note.priority);
    const timeRange = `${note.startTime?.substring(0, 5) || "—"} → ${note.endTime?.substring(0, 5) || "—"}`;

    let item = `**${statusEmoji} ${note.activity}**\n`;
    item += `⏰ ${timeRange} · ${priorityEmoji} ${note.priority || "Sem prioridade"} · 📍 ${note.activityType || "Não especificado"}\n\n`;

    if (note.description) {
      item += `📝 ${note.description}\n\n`;
    }

    if (note.collaborators && note.collaborators.length > 0) {
      item += `👥 **Colaboradores:** ${note.collaborators.join(", ")}\n\n`;
    }

    if (note.comments && note.comments.length > 0) {
      item += `💬 **Observação:** "${note.comments[0].text}" — *${note.comments[0].author}*\n\n`;
    }

    return item;
  }

  private generateInsights(notes: any[], metrics: any): string {
    let insights = `# 💡 Insights e Recomendações\n\n`;

    const criticalNotes = notes
      .filter(
        (n) =>
          n.priority?.toLowerCase().includes("urgente") ||
          n.priority?.toLowerCase().includes("alta")
      )
      .filter((n) => !n.status?.toLowerCase().includes("concluído"));

    if (criticalNotes.length > 0) {
      insights += `## 🚨 Atenção Necessária\n\n`;
      criticalNotes.forEach((note) => {
        const priorityEmoji = this.getPriorityEmoji(note.priority);
        const statusEmoji = this.getStatusEmoji(note.status);
        insights += `- ${statusEmoji} ${priorityEmoji} **${note.activity}**: ${note.description || "Requer atenção imediata"}\n`;
      });
      insights += `\n`;
    }

    if (metrics.withCollaborators > 0) {
      insights += `## 👥 Trabalho em Equipe\n\n`;
      insights += `${metrics.withCollaborators} ${metrics.withCollaborators === 1 ? "atividade envolveu" : "atividades envolveram"} colaboração. `;
      insights += `O trabalho em equipe potencializa resultados!\n\n`;
    }

    insights += `## 🎯 Próximos Passos\n\n`;

    if (metrics.notStarted > 0) {
      insights += `- 📌 **${metrics.notStarted} ${metrics.notStarted === 1 ? "tarefa pendente" : "tarefas pendentes"}** — Priorize as de alta importância\n`;
    }

    if (metrics.inProgress > 0) {
      insights += `- ⏳ **${metrics.inProgress} ${metrics.inProgress === 1 ? "atividade" : "atividades"} em andamento** — Mantenha o foco para concluir\n`;
    }

    if (metrics.completionRate < 50) {
      insights += `- 💪 **Dica:** Divida tarefas grandes em etapas menores para aumentar a produtividade\n`;
    }

    insights += `\n---\n\n`;
    insights += `*Resumo gerado automaticamente · Continue com o ótimo trabalho!* ✨\n`;

    return insights;
  }

  private getStatusEmoji(status: string): string {
    if (!status) return "📝";
    const s = status.toLowerCase();
    if (s.includes("concluído")) return "✅";
    if (s.includes("em andamento")) return "⏳";
    if (s.includes("não realizado")) return "❌";
    return "📝";
  }

  private getPriorityEmoji(priority: string): string {
    if (!priority) return "📌";
    const p = priority.toLowerCase();
    if (p.includes("urgente")) return "🚨";
    if (p.includes("alta")) return "🔴";
    if (p.includes("média")) return "🟡";
    if (p.includes("baixa")) return "🟢";
    return "📌";
  }
}
