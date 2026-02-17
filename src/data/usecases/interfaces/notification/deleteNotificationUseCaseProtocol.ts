export interface DeleteNotificationUseCaseProtocol {
  handle(data: DeleteNotificationUseCaseProtocol.Params): Promise<void>;
}

export namespace DeleteNotificationUseCaseProtocol {
  export type Params = {
    userId: string;
    ids: string[];
  };
}
