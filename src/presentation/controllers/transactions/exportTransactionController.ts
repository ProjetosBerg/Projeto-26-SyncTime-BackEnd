// presentation/controllers/transactions/exportTransactionController.ts
import { Request, Response } from "express";
import { ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { ExportTransactionUseCase } from "@/data/usecases/transactions/exportTransactionUseCase";
import { FilterParam } from "../interfaces/FilterParam";
import console from "console";

export class ExportTransactionController implements Controller {
  constructor(
    private readonly exportTransactionUseCase: ExportTransactionUseCase
  ) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const {
        monthlyRecordId,
        format = "csv",
        sortBy = "",
        order,
        columnOrder,
        visibleColumns,
      } = req.query;
      let filters: FilterParam[] = [];
      if (req.query.filters) {
        try {
          filters = JSON.parse(req.query.filters as string);
        } catch (e) {
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message: "Formato de filtros inválido. Esperado um JSON válido.",
          });
        }
      }

      if (!["pdf", "csv", "xlsx"].includes(String(format))) {
        return res.status(400).json({
          status: ResponseStatus.BAD_REQUEST,
          message: "Formato inválido. Use 'pdf', 'csv' ou 'xlsx'.",
        });
      }

      const stream = await this.exportTransactionUseCase.handle({
        monthlyRecordId: String(monthlyRecordId),
        userId: req.user!.id,
        format: String(format) as "pdf" | "csv" | "xlsx",
        sortBy: sortBy as string,
        order: String(order),
        filters,
        columnOrder: Array.isArray(columnOrder)
          ? (columnOrder as string[])
          : columnOrder
            ? String(columnOrder).split(",")
            : undefined,
        visibleColumns: Array.isArray(visibleColumns)
          ? (visibleColumns as string[])
          : visibleColumns
            ? String(visibleColumns).split(",")
            : undefined,
      });

      const ext = format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx";
      const filename = `transacoes_${monthlyRecordId}_${Date.now()}.${ext}`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader(
        "Content-Type",
        format === "pdf"
          ? "application/pdf"
          : format === "csv"
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      stream.pipe(res);

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            status: ResponseStatus.INTERNAL_SERVER_ERROR,
            message: getError(err),
          });
        }
      });

      return res;
    } catch (error: any) {
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
