import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { Comment } from "@/domain/models/postgres/NotesModel";

export interface EditNotesUseCaseProtocol {
  handle(data: EditNotesUseCaseProtocol.Params): Promise<NotesModel>;
}

export namespace EditNotesUseCaseProtocol {
  export type Params = {
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
    noteId: NotesModel["id"];
    userId: NotesModel["user_id"];
  };
}
