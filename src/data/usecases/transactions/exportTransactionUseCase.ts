// data/usecases/transactions/exportTransactionUseCase.ts
import { Readable } from "stream";
import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { GetByUserIdTransactionUseCaseProtocol } from "../interfaces/transactions/getByUserIdTransactionUseCaseProtocol";
import { getByUserIdTransactionValidationSchema } from "../validation/transactions/getByUserIdTransactionValidationSchema";
import { TransactionModelMock } from "@/domain/models/postgres/TransactionModel";
import { CustomFieldValueWithMetadata } from "./utils/customFieldValueWithMetadata";
import { ExportTransactionUseCaseProtocol } from "../interfaces/transactions/exportTransactionUseCaseProtocol";
import { GenericExportUseCaseProtocol } from "../interfaces/export/genericExportUseCaseProtocol";
import { getIo } from "@/lib/socket";
import { logger } from "@/loaders";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

/**
 * Exporta transações enriquecidas chamando o GetByUserIdTransactionUseCase e delegando a exportação genérica.
 *
 * @param {ExportTransactionUseCaseProtocol.Params} data - Dados de entrada
 * @param {string} data.userId - ID do usuário
 * @param {string} data.monthlyRecordId - ID do registro mensal
 * @param {string} data.format - Formato de exportação
 * @param {string} [data.sortBy] - Campo de ordenação
 * @param {string} [data.order] - Direção da ordenação
 * @param {FilterParam[]} [data.filters] - Filtros
 * @param {string[]} [data.columnOrder] - Ordem das colunas para exportação
 * @param {string[]} [data.visibleColumns] - Colunas visíveis para exportação (excluindo 'actions')
 *
 * @returns {Promise<Readable>} Stream do arquivo exportado
 *
 * @throws {ValidationError} Dados inválidos
 * @throws {NotFoundError} Usuário ou registro não encontrado
 * @throws {ServerError} Erros na recuperação ou exportação
 */
export class ExportTransactionUseCase
  implements ExportTransactionUseCaseProtocol
{
  constructor(
    private readonly getByUserIdTransactionUseCase: GetByUserIdTransactionUseCaseProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly genericExportUseCase: GenericExportUseCaseProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(
    data: ExportTransactionUseCaseProtocol.Params
  ): Promise<Readable> {
    try {
      await getByUserIdTransactionValidationSchema.validate(
        { userId: data.userId, monthlyRecordId: data.monthlyRecordId },
        { abortEarly: false }
      );

      if (
        data.columnOrder &&
        (!Array.isArray(data.columnOrder) ||
          data.columnOrder.some((col) => typeof col !== "string"))
      ) {
        throw new ServerError("columnOrder deve ser um array de strings.");
      }
      if (
        data.visibleColumns &&
        (!Array.isArray(data.visibleColumns) ||
          data.visibleColumns.some((col) => typeof col !== "string"))
      ) {
        throw new ServerError("visibleColumns deve ser um array de strings.");
      }

      if (!["pdf", "csv", "xlsx"].includes(data.format)) {
        throw new ServerError("Formato de exportação inválido.");
      }

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: String(data.monthlyRecordId),
          userId: data.userId,
        });
      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${data.monthlyRecordId} não encontrado`
        );
      }

      const { transactions: enrichedTransactions } =
        await this.getByUserIdTransactionUseCase.handle({
          userId: data.userId,
          monthlyRecordId: data.monthlyRecordId,
          sortBy: data.sortBy,
          order: data.order,
          filters: data.filters,
        });

      if (enrichedTransactions.length === 0) {
        throw new ServerError("Nenhuma transação encontrada para exportar.");
      }

      const { headers, exportData, metadata } = this.prepareExportData(
        enrichedTransactions,
        data.columnOrder,
        data.visibleColumns
      );

      const stream = await this.genericExportUseCase.handle({
        data: exportData,
        headers,
        format: data.format,
        metadata,
      });

      const formatLabel = data.format.toUpperCase();
      const transactionCount = enrichedTransactions.length;

      const newNotification = await this.notificationRepository.create({
        title: `Exportação de transações do registro mensal ${monthlyRecord.title} concluída (${formatLabel})`,
        entity: "Transação",
        idEntity: data.monthlyRecordId,
        userId: data.userId,
        typeOfAction: "Exportação",
        payload: {
          format: data.format,
          transactionCount,
          totalExported: transactionCount,
          exportedAt: new Date().toISOString(),
          monthlyRecordTitle: monthlyRecord.title,
          stream: stream,
        },
      });

      const countNewNotification =
        await this.notificationRepository.countNewByUserId({
          userId: data.userId,
        });

      const io = getIo();
      const now = new Date();
      if (io && newNotification) {
        const notificationData = {
          id: newNotification.id,
          title: newNotification.title,
          entity: newNotification.entity,
          idEntity: newNotification.idEntity,
          path: newNotification.path,
          typeOfAction: newNotification.typeOfAction,
          payload: newNotification.payload,
          createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          countNewNotification,
        };

        io.to(`user_${data.userId}`).emit("newNotification", notificationData);
        logger.info(
          `Notificação de exportação (${formatLabel}, ${transactionCount} transações) emitida via Socket.IO para userId: ${data.userId}`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado → notificação de exportação não enviada em tempo real"
        );
      }

      return stream;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      const errorMessage = error.message || "Erro interno durante a exportação";
      throw new ServerError(
        `Falha na exportação das transações: ${errorMessage}`
      );
    }
  }

  private prepareExportData(
    enrichedTransactions: Array<{
      transaction: TransactionModelMock;
      customFields?: CustomFieldValueWithMetadata[];
      recordTypeId?: number;
    }>,
    columnOrder?: string[],
    visibleColumns?: string[]
  ): { headers: string[]; exportData: any[]; metadata: object } {
    const keyToHeader: Record<string, string> = {
      title: "Titulo",
      description: "Descrição",
      amount: "Quantia",
      transaction_date: "Data da Transação",
      category_name: "Nome da categoria",
      created_at: "Criado em",
      updated_at: "Atualizado em",
    };

    const defaultColumnOrder = [
      "title",
      "description",
      "amount",
      "transaction_date",
      "category_name",
      "created_at",
      "updated_at",
    ];
    const defaultVisibleColumns = defaultColumnOrder;

    const orderedColumns = columnOrder || defaultColumnOrder;
    const visibleCols = visibleColumns || defaultVisibleColumns;

    const exportableVisible = visibleCols.filter(
      (col) => col !== "actions" && col !== "id"
    );

    const orderedVisibleColumns = orderedColumns.filter((col) =>
      exportableVisible.includes(col)
    );

    const firstCustomFields = enrichedTransactions[0]?.customFields || [];
    const customKeyToHeader: Record<string, string> = {};
    const customKeyToFieldId: Record<string, number> = {};
    firstCustomFields.forEach((cf) => {
      const labelSlug = (cf.label || `field_${cf.custom_field_id}`)
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      const customKey = `custom_${labelSlug}`;
      const headerName = cf.label || `Campo Custom ${cf.custom_field_id}`;
      customKeyToHeader[customKey] = headerName;
      customKeyToFieldId[customKey] = Number(cf.custom_field_id);
    });

    const headers: string[] = [];
    const orderedVisibleWithDataKeys: Array<{
      header: string;
      dataKey: string;
      isCustom?: boolean;
      customFieldId?: number;
    }> = [];

    orderedVisibleColumns.forEach((col) => {
      let header: string | undefined;
      let dataKey = col;
      let isCustom = false;
      let customFieldId: number | undefined;

      if (keyToHeader[col]) {
        header = keyToHeader[col];
      } else if (customKeyToHeader[col]) {
        header = customKeyToHeader[col];
        isCustom = true;
        customFieldId = customKeyToFieldId[col];
      } else {
      }

      if (header) {
        headers.push(header);
        orderedVisibleWithDataKeys.push({
          header,
          dataKey,
          isCustom,
          customFieldId,
        });
      }
    });

    if (headers.length === 0) {
      throw new ServerError("Nenhuma coluna válida para exportar.");
    }

    const exportData = enrichedTransactions.map((enriched, index) => {
      const transaction = enriched.transaction;
      const row: any = {};
      const customFieldsMap = new Map(
        (enriched.customFields || []).map((cf) => {
          const labelSlug = (cf.label || `field_${cf.custom_field_id}`)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
          const customKey = `custom_${labelSlug}`;
          return [customKey, cf.value || ""];
        })
      );

      orderedVisibleWithDataKeys.forEach(
        ({ header, dataKey, isCustom, customFieldId }) => {
          let value: any = "";

          if (!isCustom) {
            value = transaction[dataKey as keyof typeof transaction];
            if (
              dataKey === "created_at" ||
              dataKey === "updated_at" ||
              dataKey === "transaction_date"
            ) {
              value = value
                ? new Date(value as any).toLocaleDateString("pt-BR")
                : "";
            }
          } else {
            value = customFieldsMap.get(dataKey) || "";
            if (!value && customFieldId) {
              const matchingCf = enriched.customFields?.find(
                (cf) => Number(cf.custom_field_id) === customFieldId
              );
              value = matchingCf?.value || "";
            }
          }

          row[header] = value;
        }
      );

      return row;
    });

    const metadata = {
      title: `Relatório de Transações - Registro Mensal Referente a  ${new Date(
        enrichedTransactions[0].transaction.transaction_date
      ).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })}`,
      Total: `${enrichedTransactions.length} transações exportadas`,
    };

    return { headers, exportData, metadata };
  }
}
