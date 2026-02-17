import { NotesModel } from "@/domain/models/postgres/NotesModel";

export interface DeleteNotesUseCaseProtocol {
  handle(data: DeleteNotesUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteNotesUseCaseProtocol {
  export type Params = {
    noteId: NotesModel["id"];
    userId: NotesModel["user_id"];
  };
}
