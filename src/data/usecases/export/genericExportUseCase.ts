import { Readable } from "stream";
import * as csvStringify from "csv-stringify/sync";
import * as ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { ServerError } from "@/data/errors/ServerError";
import { GenericExportUseCaseProtocol } from "../interfaces/export/genericExportUseCaseProtocol";

/**
 * Use case genérico para exportar dados em formatos PDF, CSV ou XLSX com design moderno.
 */
export class GenericExportUseCase implements GenericExportUseCaseProtocol {
  async handle(data: GenericExportUseCaseProtocol.Params): Promise<Readable> {
    try {
      if (!["pdf", "csv", "xlsx"].includes(data.format)) {
        throw new ServerError(
          "Formato de exportação inválido. Use 'pdf', 'csv' ou 'xlsx'."
        );
      }

      if (data.data.length === 0) {
        throw new ServerError("Nenhum dado fornecido para exportar.");
      }

      const rows: string[][] = data.data.map((item) =>
        data.headers.map((header) => String(item[header] || ""))
      );

      switch (data.format) {
        case "csv":
          return this.generateCSVStream(data.headers, rows);
        case "xlsx":
          return await this.generateXLSXStream(data.headers, rows);
        case "pdf":
          return await this.generatePDFStream(
            data.headers,
            rows,
            data.metadata || {}
          );
        default:
          throw new ServerError("Formato não suportado.");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Erro interno durante a exportação";
      throw new ServerError(`Falha na exportação genérica: ${errorMessage}`);
    }
  }

  private generateCSVStream(headers: string[], rows: string[][]): Readable {
    const csvContent = csvStringify.stringify([headers, ...rows], {
      delimiter: ";",
      quoted: false,
      quoted_string: true,
      header: false,
    });

    const BOM = "\uFEFF";
    const stream = new Readable({
      read() {
        this.push(BOM + csvContent);
        this.push(null);
      },
    });
    return stream;
  }

  private async generateXLSXStream(
    headers: string[],
    rows: string[][]
  ): Promise<Readable> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dados");

    const headersUpperCase = headers.map((h) => h.toUpperCase());
    worksheet.addRow(headersUpperCase);

    headers.forEach((header, idx) => {
      const cell = worksheet.getCell(1, idx + 1);
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
        name: "Segoe UI",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        bottom: { style: "thick", color: { argb: "FF1E40AF" } },
      };
    });

    worksheet.getRow(1).height = 25;

    rows.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row);

      excelRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: "Segoe UI",
          size: 11,
        };

        if (rowIndex % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      });

      excelRow.height = 20;
    });

    worksheet.columns.forEach((column, idx) => {
      const headerText = headers[idx] || "";
      let maxLength = headerText.length;

      rows.forEach((row) => {
        const cellLength = String(row[idx] || "").length;
        maxLength = Math.max(maxLength, cellLength);
      });

      column.width = Math.min(Math.max(15, maxLength + 3), 50);
    });

    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const stream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    return stream;
  }

  private async generatePDFStream(
    headers: string[],
    rows: string[][],
    metadata: any
  ): Promise<Readable> {
    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
      bufferPages: true,
    });

    doc.save();
    doc.rect(0, 0, doc.page.width, 55).fill("#2563EB");
    doc.restore();

    if (metadata?.title) {
      doc.save();
      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(metadata.title, 0, 18, {
          align: "center",
          width: doc.page.width,
        });
      doc.restore();
    }

    let metaY = 60;
    const metaEntries = Object.entries(metadata).filter(
      ([key]) => key !== "title"
    );

    if (metaEntries.length > 0) {
      doc.save();
      doc
        .roundedRect(
          30,
          metaY,
          doc.page.width - 60,
          metaEntries.length * 14 + 10,
          3
        )
        .fillAndStroke("#F8FAFC", "#E2E8F0");
      doc.restore();

      metaEntries.forEach(([key, value], idx) => {
        doc
          .fillColor("#475569")
          .font("Helvetica")
          .fontSize(8)
          .text(`${key}: `, 35, metaY + 6 + idx * 14, { continued: true })
          .font("Helvetica-Bold")
          .fillColor("#1E293B")
          .text(String(value));
      });

      metaY += metaEntries.length * 14 + 18;
    } else {
      metaY = 65;
    }

    const tableTop = metaY;
    const pageWidth = doc.page.width - 60;
    const baseRowHeight = 35;
    const cellPadding = 6;
    const minColumnWidth = 100;

    const calculateTextWidth = (
      text: string,
      fontSize: number,
      isBold = false
    ): number => {
      doc.fontSize(fontSize);
      doc.font(isBold ? "Helvetica-Bold" : "Helvetica");
      return doc.widthOfString(text);
    };

    const columnWidths: number[] = headers.map((header, colIndex) => {
      let maxWidth = calculateTextWidth(header.toUpperCase(), 11, true);
      rows.forEach((row) => {
        const cellText = row[colIndex] || "";
        const cellWidth = calculateTextWidth(cellText, 10);
        maxWidth = Math.max(maxWidth, cellWidth);
      });
      return Math.max(maxWidth + cellPadding * 2, minColumnWidth);
    });

    const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
    if (totalWidth > pageWidth) {
      const scale = (pageWidth * 0.95) / totalWidth;
      columnWidths.forEach((w, i) => {
        columnWidths[i] = Math.max(minColumnWidth * 0.8, w * scale);
      });
    }

    const calculateCellHeight = (text: string, width: number): number => {
      const textHeight = doc.heightOfString(text, {
        width: width - cellPadding * 2,
        align: "left",
      });
      return Math.max(textHeight + cellPadding * 2, baseRowHeight);
    };

    const drawCell = (
      text: string,
      x: number,
      y: number,
      width: number,
      height: number,
      options: { header?: boolean; alternate?: boolean } = {}
    ) => {
      doc.save();

      if (options.header) {
        doc.rect(x, y, width, height).fillAndStroke("#2563EB", "#1E40AF");

        doc
          .fillColor("#FFFFFF")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(text, x + cellPadding, y + (height - 11) / 2, {
            width: width - cellPadding * 2,
            align: "center",
          });
      } else {
        const fillColor = options.alternate ? "#F8FAFC" : "#FFFFFF";
        doc.rect(x, y, width, height).fillAndStroke(fillColor, "#E2E8F0");

        doc
          .fillColor("#1E293B")
          .font("Helvetica")
          .fontSize(10)
          .text(text, x + cellPadding, y + cellPadding, {
            width: width - cellPadding * 2,
            align: "left",
            lineGap: 2,
          });
      }

      doc.restore();
    };

    let currentY = tableTop;
    let currentX = 30;

    headers.forEach((header, i) => {
      drawCell(
        header.toUpperCase(),
        currentX,
        currentY,
        columnWidths[i],
        baseRowHeight,
        { header: true }
      );
      currentX += columnWidths[i];
    });

    currentY += baseRowHeight;

    rows.forEach((row, rowIndex) => {
      const rowHeights = row.map((cell, i) =>
        calculateCellHeight(cell, columnWidths[i])
      );
      const dynamicRowHeight = Math.max(...rowHeights, baseRowHeight);

      if (currentY + dynamicRowHeight > doc.page.height - 60) {
        doc.addPage({ layout: "landscape" });
        currentY = 30;

        currentX = 30;
        headers.forEach((header, i) => {
          drawCell(
            header.toUpperCase(),
            currentX,
            currentY,
            columnWidths[i],
            baseRowHeight,
            { header: true }
          );
          currentX += columnWidths[i];
        });
        currentY += baseRowHeight;
      }

      currentX = 30;
      row.forEach((cell, i) => {
        drawCell(cell, currentX, currentY, columnWidths[i], dynamicRowHeight, {
          alternate: rowIndex % 2 === 0,
        });
        currentX += columnWidths[i];
      });

      currentY += dynamicRowHeight;
    });

    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      doc.save();
      doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill("#F8FAFC");
      doc.restore();
    }

    doc.end();

    return new Promise<Readable>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const stream = new Readable({
          read() {
            this.push(buffer);
            this.push(null);
          },
        });
        resolve(stream);
      });
      doc.on("error", reject);
    });
  }
}
