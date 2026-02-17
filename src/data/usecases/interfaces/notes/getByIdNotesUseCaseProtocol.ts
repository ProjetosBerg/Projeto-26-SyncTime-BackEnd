import { NotesModel } from "@/domain/models/postgres/NotesModel";

export interface GetByIdNotesUseCaseProtocol {
  handle(data: GetByIdNotesUseCaseProtocol.Params): Promise<NotesModel>;
}

export namespace GetByIdNotesUseCaseProtocol {
  export type Params = {
    noteId: NotesModel["id"];
    userId: NotesModel["user_id"];
  };
}
