import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { Comment } from "@/domain/models/postgres/NotesModel";

export interface NotesRepositoryProtocol {
  create(data: NotesRepositoryProtocol.CreateNote): Promise<NotesModel>;
  findByIdAndUserId(
    data: NotesRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<NotesModel | null>;
  updateNote(
    data: NotesRepositoryProtocol.UpdateNoteParams
  ): Promise<NotesModel>;
  findByUserId(
    data: NotesRepositoryProtocol.FindByUserIdParams
  ): Promise<{ notes: NotesModel[]; total: number }>;
  deleteNote(data: NotesRepositoryProtocol.DeleteNoteParams): Promise<void>;
  findByUserIdAndDate(
    data: NotesRepositoryProtocol.FindByUserIdAndDateParams
  ): Promise<{ notes: NotesModel[]; total: number }>;
  findByUserIdAndSummaryDate(
    data: NotesRepositoryProtocol.FindByUserIdAndSummaryDateParams
  ): Promise<NotesModel | null>;
}

export namespace NotesRepositoryProtocol {
  export type CreateNote = {
    status: NotesModel["status"];
    collaborators?: NotesModel["collaborators"];
    priority?: NotesModel["priority"];
    category_id?: NotesModel["category_id"];
    activity?: NotesModel["activity"];
    activityType?: NotesModel["activityType"];
    description?: NotesModel["description"];
    startTime?: NotesModel["startTime"];
    endTime?: NotesModel["endTime"];
    comments?: NotesModel["comments"];
    routine_id: NotesModel["routine_id"];
    userId: NotesModel["user_id"];
    summaryDay?: NotesModel["summaryDay"];
    dateOfNote?: NotesModel["dateOfNote"];
  };

  export type FindByIdAndUserIdParams = {
    id: NotesModel["id"];
    userId: NotesModel["user_id"];
  };

  export type UpdateNoteParams = {
    status?: NotesModel["status"];
    collaborators?: NotesModel["collaborators"];
    priority?: NotesModel["priority"];
    category_id?: NotesModel["category_id"];
    activity?: NotesModel["activity"];
    activityType?: NotesModel["activityType"];
    description?: NotesModel["description"];
    startTime?: NotesModel["startTime"];
    endTime?: NotesModel["endTime"];
    comments?: Comment[];
    routine_id?: NotesModel["routine_id"];
    id: NotesModel["id"];
    userId: NotesModel["user_id"];
  };

  export type FindByUserIdParams = {
    userId: NotesModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };

  export type DeleteNoteParams = {
    id: NotesModel["id"];
    userId: NotesModel["user_id"];
  };

  export type FindByUserIdAndDateParams = {
    userId: NotesModel["user_id"];
    date: string;
  };

  export type FindByUserIdAndSummaryDateParams = {
    userId: NotesModel["user_id"];
    formattedDate: string;
  };
}
