export interface InboxItem {
  id: string;
  title: string;
  updated_at: Date;
  path: string;
  type: "note" | "category" | "monthly_record" | "routine" | "Custom_fields";
  entityName:
    | "Anotação"
    | "Categoria"
    | "Relatório Mensal"
    | "Rotina"
    | "Custom Fields";
  entityRef?: Record<string, any>;
}

export interface GetInboxUserUseCaseProtocol {
  handle(data: GetInboxUserUseCaseProtocol.Params): Promise<InboxItem[]>;
}

export namespace GetInboxUserUseCaseProtocol {
  export type Params = {
    userId: string;
  };
}
