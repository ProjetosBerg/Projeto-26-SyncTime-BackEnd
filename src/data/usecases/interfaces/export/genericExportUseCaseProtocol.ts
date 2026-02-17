import { Readable } from "stream";

export interface GenericExportUseCaseProtocol {
  handle(data: GenericExportUseCaseProtocol.Params): Promise<Readable>;
}

export namespace GenericExportUseCaseProtocol {
  export type Params = {
    data: any[];
    headers: string[];
    format: "pdf" | "csv" | "xlsx";
    metadata?: {
      title?: string;
      [key: string]: any;
    };
  };
}
