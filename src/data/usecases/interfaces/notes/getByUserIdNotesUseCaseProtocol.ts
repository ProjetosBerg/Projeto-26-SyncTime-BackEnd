import { NotesModel } from "@/domain/models/postgres/NotesModel";

export interface GetByUserIdNotesUseCaseProtocol {
  handle(
    data: GetByUserIdNotesUseCaseProtocol.Params
  ): Promise<{ notes: NotesModel[]; total: number }>;
}

export namespace GetByUserIdNotesUseCaseProtocol {
  export type Params = {
    userId: NotesModel["user_id"];
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: string;
  };
}
