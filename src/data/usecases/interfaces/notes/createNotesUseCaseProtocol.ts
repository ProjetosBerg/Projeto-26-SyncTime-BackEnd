import { NotesModel } from "@/domain/models/postgres/NotesModel";

export interface CreateNotesUseCaseProtocol {
  handle(data: CreateNotesUseCaseProtocol.Params): Promise<NotesModel>;
}

export namespace CreateNotesUseCaseProtocol {
  export type Params = {
    status: NotesModel["status"];
    collaborators?: NotesModel["collaborators"];
    priority: NotesModel["priority"];
    category_id?: NotesModel["category_id"];
    activity: NotesModel["activity"];
    activityType: NotesModel["activityType"];
    description: NotesModel["description"];
    startTime: NotesModel["startTime"];
    endTime: NotesModel["endTime"];
    comments?: NotesModel["comments"];
    routine_id: NotesModel["routine_id"];
    userId: NotesModel["user_id"];
    dateOfNote?: NotesModel["dateOfNote"];
  };
}
