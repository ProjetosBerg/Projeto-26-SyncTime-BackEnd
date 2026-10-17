import { MyDayModel } from "@/domain/models/postgres/MyDayModel";

export interface GetMyDayUseCaseProtocol {
  handle(data: GetMyDayUseCaseProtocol.Params): Promise<MyDayModel>;
}

export namespace GetMyDayUseCaseProtocol {
  export type Params = {
    userId: string;
    date: string;
  };
}
