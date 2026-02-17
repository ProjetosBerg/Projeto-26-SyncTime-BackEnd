import { Between, ILike, Not, Repository, getRepository } from "typeorm";
import { Notes } from "@/domain/entities/postgres/Notes";
import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { User } from "@/domain/entities/postgres/User";
import { Routines } from "@/domain/entities/postgres/Routines";
import { Category } from "@/domain/entities/postgres/Category";
import { NotesRepositoryProtocol } from "../interfaces/notesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class NotesRepository implements NotesRepositoryProtocol {
  private repository: Repository<Notes>;

  constructor() {
    this.repository = getRepository(Notes);
  }

  /**
   * Cria uma nova Anotação no banco de dados
   * @param {NotesRepositoryProtocol.CreateNote} data - Os dados para criação da Anotação
   */
  async create(data: NotesRepositoryProtocol.CreateNote): Promise<NotesModel> {
    const note = this.repository.create({
      status: data.status,
      collaborators: data.collaborators,
      priority: data.priority,
      activity: data.activity,
      activityType: data.activityType,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      comments: data.comments,
      summaryDay: data.summaryDay,
      routine: { id: data.routine_id } as Routines,
      user: { id: data.userId } as User,
      ...(data.category_id && {
        category: { id: data.category_id } as Category,
      }),
      dateOfNote: data.dateOfNote,
    });

    const savedNote = await this.repository.save(note);
    return {
      id: savedNote.id,
      status: savedNote.status,
      collaborators: savedNote.collaborators,
      priority: savedNote.priority,
      category_id: savedNote.category?.id,
      activity: savedNote.activity,
      activityType: savedNote.activityType,
      description: savedNote.description,
      startTime: savedNote.startTime,
      endTime: savedNote.endTime,
      comments: savedNote.comments,
      summaryDay: savedNote.summaryDay,
      routine_id: savedNote.routine.id,
      user_id: savedNote.user.id,
      created_at: savedNote.created_at,
      updated_at: savedNote.updated_at,
    };
  }

  /**
   * Busca uma Anotação por ID e ID do usuário
   * @param {NotesRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID da Anotação
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<NotesModel | null>} A Anotação encontrada ou null se não existir
   */
  async findByIdAndUserId(
    data: NotesRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<NotesModel | null> {
    const note = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "routine", "category"],
    });

    if (!note) return null;

    return {
      id: note.id,
      status: note.status,
      collaborators: note.collaborators,
      priority: note.priority,
      category_id: note.category?.id,
      activity: note.activity,
      activityType: note.activityType,
      description: note.description,
      startTime: note.startTime,
      endTime: note.endTime,
      comments: note.comments,
      summaryDay: note.summaryDay,
      routine_id: note.routine.id,
      user_id: note.user.id,
      created_at: note.created_at,
      updated_at: note.updated_at,
      dateOfNote: note.dateOfNote,
    };
  }

  /**
   * Busca Anotaçãos por ID do usuário
   * @param {NotesRepositoryProtocol.FindByUserIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<{ notes: NotesModel[]; total: number }>} Lista de Anotaçãos encontradas
   */
  async findByUserId(
    data: NotesRepositoryProtocol.FindByUserIdParams
  ): Promise<{ notes: NotesModel[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const search = data.search || "";
    const sortBy = data.sortBy || "activity";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const whereCondition = search
      ? [
          { activity: ILike(`%${search}%`), user: { id: data.userId } },
          { description: ILike(`%${search}%`), user: { id: data.userId } },
        ]
      : { user: { id: data.userId } };

    const [notes, total] = await this.repository.findAndCount({
      where: whereCondition,
      relations: ["user", "routine", "category"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      status: note.status,
      collaborators: note.collaborators,
      priority: note.priority,
      category_id: note.category?.id,
      activity: note.activity,
      activityType: note.activityType,
      description: note.description,
      startTime: note.startTime,
      endTime: note.endTime,
      comments: note.comments,
      summaryDay: note.summaryDay,
      routine_id: note.routine.id,
      user_id: note.user.id,
      created_at: note.created_at,
      updated_at: note.updated_at,
    }));

    return {
      notes: formattedNotes,
      total,
    };
  }

  /**
   * Atualiza uma Anotação no banco de dados
   * @param {NotesRepositoryProtocol.UpdateNoteParams} data - Os dados para atualização
   * @param {string} data.id - ID da Anotação
   * @param {string} data.userId - ID do usuário
   * @param {string} [data.status] - Novo status
   * @param {string[]} [data.collaborators] - Novos colaboradores
   * @param {string} [data.priority] - Nova prioridade
   * @param {string} [data.category_id] - Novo ID da categoria
   * @param {string} [data.activity] - Nova atividade
   * @param {string} [data.activityType] - Novo tipo de atividade
   * @param {string} [data.description] - Nova descrição
   * @param {string} [data.startTime] - Nova hora de início
   * @param {string} [data.endTime] - Nova hora de fim
   * @param {Comment[]} [data.comments] - Novos comentários
   * @param {string} [data.routine_id] - Novo ID da rotina
   * @returns {Promise<NotesModel>} A Anotação atualizada
   * @throws {NotFoundError} Quando a Anotação não é encontrada
   */
  async updateNote(
    data: NotesRepositoryProtocol.UpdateNoteParams
  ): Promise<NotesModel> {
    const note = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "routine", "category"],
    });

    if (!note) {
      throw new NotFoundError(
        `Anotação com ID ${data.id} não encontrada para este usuário`
      );
    }

    if (data.status !== undefined) note.status = data.status;
    if (data.collaborators !== undefined)
      note.collaborators = data.collaborators;
    if (data.priority !== undefined) note.priority = data.priority;
    if (data.activity !== undefined) note.activity = data.activity;
    if (data.activityType !== undefined) note.activityType = data.activityType;
    if (data.description !== undefined) note.description = data.description;
    if (data.startTime !== undefined) note.startTime = data.startTime;
    if (data.endTime !== undefined) note.endTime = data.endTime;
    if (data.comments !== undefined) note.comments = data.comments;
    if (data.routine_id !== undefined)
      note.routine = { id: data.routine_id } as Routines;
    if (data.category_id !== undefined)
      note.category = data.category_id
        ? ({ id: data.category_id } as Category)
        : undefined;
    note.updated_at = new Date();

    const updatedNote = await this.repository.save(note);
    return {
      id: updatedNote.id,
      status: updatedNote.status,
      collaborators: updatedNote.collaborators,
      priority: updatedNote.priority,
      category_id: updatedNote.category?.id,
      activity: updatedNote.activity,
      activityType: updatedNote.activityType,
      description: updatedNote.description,
      startTime: updatedNote.startTime,
      endTime: updatedNote.endTime,
      comments: updatedNote.comments,
      routine_id: updatedNote.routine.id,
      user_id: updatedNote.user.id,
      created_at: updatedNote.created_at,
      updated_at: updatedNote.updated_at,
    };
  }

  /**
   * Deleta uma nota do banco de dados
   * @param {NotesRepositoryProtocol.DeleteNoteParams} data - Os dados para deleção
   * @param {string} data.id - ID da nota
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando a nota não é encontrada
   */
  async deleteNote(
    data: NotesRepositoryProtocol.DeleteNoteParams
  ): Promise<void> {
    const note = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
    });

    if (!note) {
      throw new NotFoundError(
        `Anotação com ID ${data.id} não encontrada para este usuário`
      );
    }

    await this.repository.delete({
      id: data.id,
      user: { id: data.userId },
    });
  }

  /**
   * Busca notas por ID do usuário e data específica (excluindo notas de resumo)
   * @param {NotesRepositoryProtocol.FindByUserIdAndDateParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.date - Data no formato YYYY-MM-DD
   * @returns {Promise<{ notes: NotesModel[]; total: number }>} Lista de notas e total
   */
  async findByUserIdAndDate(
    data: NotesRepositoryProtocol.FindByUserIdAndDateParams
  ): Promise<{ notes: NotesModel[]; total: number }> {
    const startDate = new Date(data.date + "T00:00:00.000Z");
    const endDate = new Date(data.date + "T23:59:59.999Z");

    const [notes, total] = await this.repository.findAndCount({
      where: {
        user: { id: data.userId },
        dateOfNote: Between(startDate, endDate),
        activity: Not(ILike("Resumo do Dia - %")),
      },
      relations: ["user", "routine", "category"],
    });

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      status: note.status,
      collaborators: note.collaborators,
      priority: note.priority,
      category_id: note.category?.id,
      activity: note.activity,
      activityType: note.activityType,
      description: note.description,
      startTime: note.startTime,
      endTime: note.endTime,
      comments: note.comments,
      routine_id: note.routine.id,
      user_id: note.user.id,
      summaryDay: note.summaryDay,
      created_at: note.created_at,
      updated_at: note.updated_at,
    }));

    return {
      notes: formattedNotes,
      total,
    };
  }

  /**
   * Busca nota de resumo por ID do usuário e data formatada (ex: "09/11/2025")
   * @param {NotesRepositoryProtocol.FindByUserIdAndSummaryDateParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.formattedDate - Data formatada pt-BR
   * @returns {Promise<NotesModel | null>} A nota de resumo ou null
   */
  async findByUserIdAndSummaryDate(
    data: NotesRepositoryProtocol.FindByUserIdAndSummaryDateParams
  ): Promise<NotesModel | null> {
    const note = await this.repository.findOne({
      where: {
        user: { id: data.userId },
        activity: ILike(`Resumo do Dia - ${data.formattedDate}`),
      },
      relations: ["user", "routine", "category"],
    });

    if (!note) return null;

    return {
      id: note.id,
      status: note.status,
      collaborators: note.collaborators,
      priority: note.priority,
      category_id: note.category?.id,
      activity: note.activity,
      activityType: note.activityType,
      description: note.description,
      startTime: note.startTime,
      endTime: note.endTime,
      comments: note.comments,
      routine_id: note.routine.id,
      user_id: note.user.id,
      summaryDay: note.summaryDay,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };
  }
}
