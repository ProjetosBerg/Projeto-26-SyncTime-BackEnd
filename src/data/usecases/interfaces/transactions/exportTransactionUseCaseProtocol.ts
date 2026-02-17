import { Readable } from "stream";
import { GetByUserIdTransactionUseCaseProtocol } from "./getByUserIdTransactionUseCaseProtocol";

export interface ExportTransactionUseCaseProtocol {
  handle(data: ExportTransactionUseCaseProtocol.Params): Promise<Readable>;
}

export namespace ExportTransactionUseCaseProtocol {
  export type Params = GetByUserIdTransactionUseCaseProtocol.Params & {
    format: "pdf" | "csv" | "xlsx";
    columnOrder?: string[];
    visibleColumns?: string[];
  };
}
