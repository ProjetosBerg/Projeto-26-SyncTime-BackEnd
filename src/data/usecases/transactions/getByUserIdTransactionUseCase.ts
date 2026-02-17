import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { TransactionModelMock } from "@/domain/models/postgres/TransactionModel";
import { GetByUserIdTransactionUseCaseProtocol } from "../interfaces/transactions/getByUserIdTransactionUseCaseProtocol";
import { getByUserIdTransactionValidationSchema } from "../validation/transactions/getByUserIdTransactionValidationSchema";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { CustomFieldValueWithMetadata } from "./utils/customFieldValueWithMetadata";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";
import { FilterParam } from "@/presentation/controllers/interfaces/FilterParam";

/**
 * Recupera todas as transações de um usuário específico para um registro mensal, enriquecidas com campos customizados
 *
 * @param {GetByUserIdTransactionUseCaseProtocol.Params} data - Os dados de entrada para a recuperação das transações
 * @param {string} data.userId - O ID do usuário proprietário das transações
 * @param {string} data.monthlyRecordId - O ID do registro mensal associado às transações
 *
 * @returns {Promise<{ transactions: Array<{ transaction: TransactionModelMock; customFields?: CustomFieldValueWithMetadata[]; recordTypeId?: number; }>; totalAmount: number }>} Um array de transações enriquecidas com campos customizados e o valor total somado dos amounts
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário ou o registro mensal não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByUserIdTransactionUseCase
  implements GetByUserIdTransactionUseCaseProtocol
{
  constructor(
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly customFieldRepository: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol
  ) {}

  async handle(data: GetByUserIdTransactionUseCaseProtocol.Params): Promise<{
    transactions: Array<{
      transaction: TransactionModelMock;
      customFields?: CustomFieldValueWithMetadata[];
      recordTypeId?: number;
    }>;
    totalAmount: number;
  }> {
    let recordTypeId: number | undefined = undefined;
    try {
      await getByUserIdTransactionValidationSchema.validate(data, {
        abortEarly: false,
      });

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
          `Registro mensal com ID ${data.monthlyRecordId} não encontrado para este usuário`
        );
      }

      const transactions =
        await this.transactionRepository.findByUserIdAndMonthlyRecordId({
          userId: data.userId,
          monthlyRecordId: data.monthlyRecordId,
        });

      let fieldTypes: Record<string, string> = {
        title: "text",
        description: "text",
        amount: "number",
        transaction_date: "date",
        created_at: "date",
        updated_at: "date",
      };

      let customFieldDefs: CustomFieldModel[] = [];

      if (transactions.length > 0) {
        const category = await this.categoryRepository.findByIdAndUserId({
          id: String(transactions[0].category_id),
          userId: data.userId,
        });

        if (!category) {
          throw new NotFoundError(
            `Categoria com ID ${transactions[0].category_id} não encontrada para este usuário`
          );
        }
        recordTypeId = category.record_type_id;

        const { customFields } =
          await this.customFieldRepository.findByRecordTypeId({
            record_type_id: recordTypeId!,
            category_id: transactions[0].category_id,
            user_id: data.userId,
          });

        customFieldDefs = customFields;

        const customFieldTypes = customFieldDefs.reduce(
          (acc: Record<string, string>, def: CustomFieldModel) => {
            const ftype =
              def.type === "multiple" ? "text" : def.type.toLowerCase();
            acc[`customFields.${def.name}`] = ftype;
            return acc;
          },
          {}
        );

        fieldTypes = { ...fieldTypes, ...customFieldTypes };
      }

      const enrichedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const customFieldValues =
            await this.transactionCustomFieldRepository.findByTransactionId({
              transaction_id: transaction.id,
              user_id: data.userId,
            });

          let enrichedCustomFields: CustomFieldValueWithMetadata[] = [];
          if (customFieldValues.length > 0) {
            enrichedCustomFields = customFieldValues.map((value) => {
              const cfDef = customFieldDefs.find(
                (cf) => cf.id === value.custom_field_id
              );
              if (!cfDef) {
                throw new ServerError(
                  `Definição de campo customizado não encontrada para ID ${value.custom_field_id}`
                );
              }
              return {
                id: value.id!,
                custom_field_id: value.custom_field_id!,
                value: value.value,
                label: cfDef.label,
                type: cfDef.type,
                required: cfDef.required,
              };
            });
          }

          return {
            transaction,
            customFields: enrichedCustomFields,
            recordTypeId,
          };
        })
      );

      let result = enrichedTransactions;

      if (data.filters && data.filters.length > 0) {
        const tempItems = enrichedTransactions.map((enriched) => {
          const customMap: Record<string, string> = {};
          if (enriched.customFields && enriched.customFields.length > 0) {
            enriched.customFields.forEach((cf) => {
              const def = customFieldDefs.find(
                (d) => d.id === cf.custom_field_id
              );
              if (def) {
                const mapVal = Array.isArray(cf.value)
                  ? cf.value.join(", ")
                  : String(cf.value);
                customMap[def.name] = mapVal;
              }
            });
          }
          return {
            transaction: enriched.transaction,
            customFields: customMap,
          };
        });

        const filteredTemp = this.applyFilters(
          tempItems,
          data.filters,
          fieldTypes
        );

        const idToEnriched = new Map(
          enrichedTransactions.map((e) => [e.transaction.id, e])
        );

        result = filteredTemp.map(
          (temp) => idToEnriched.get(temp.transaction.id)!
        );
      }

      if (data.sortBy) {
        const direction = data.order === "desc" ? "desc" : "asc";

        const tempItemsForSort = result.map((enriched) => {
          const customMap: Record<string, string> = {};
          if (enriched.customFields && enriched.customFields.length > 0) {
            enriched.customFields.forEach((cf) => {
              const def = customFieldDefs.find(
                (d) => d.id === cf.custom_field_id
              );
              if (def) {
                const mapVal = Array.isArray(cf.value)
                  ? cf.value.join(", ")
                  : String(cf.value);
                customMap[def.name] = mapVal;
              }
            });
          }
          return {
            transaction: enriched.transaction,
            customFields: customMap,
          };
        });

        const sortedTemp = this.applySort(
          tempItemsForSort,
          data.sortBy,
          direction,
          fieldTypes
        );

        const idToEnriched = new Map(result.map((e) => [e.transaction.id, e]));

        result = sortedTemp.map(
          (temp) => idToEnriched.get(temp.transaction.id)!
        );
      }

      const totalAmount = result.reduce(
        (acc, { transaction }) =>
          acc + (parseFloat(String(transaction.amount)) || 0),
        0
      );

      return { transactions: result, totalAmount };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca das transações: ${errorMessage}`);
    }
  }

  private applyFilters(
    items: any[],
    filters: FilterParam[],
    fieldTypes: Record<string, string>
  ): any[] {
    return items.filter((item) =>
      filters.every((filter) => {
        const { val, type } = this.getFieldValueAndType(
          item,
          filter.field,
          fieldTypes
        );

        return this.applyOperator(
          val,
          filter.operator,
          type,
          filter.value,
          filter.value2
        );
      })
    );
  }

  private applySort(
    items: any[],
    sortBy: string,
    order: "asc" | "desc",
    fieldTypes: Record<string, string>
  ): any[] {
    return [...items].sort((a, b) => {
      const { val: aVal, type } = this.getFieldValueAndType(
        a,
        sortBy,
        fieldTypes
      );
      const { val: bVal } = this.getFieldValueAndType(b, sortBy, fieldTypes);
      const aNorm = this.normalize(aVal, type);
      const bNorm = this.normalize(bVal, type);
      if (aNorm < bNorm) {
        return order === "asc" ? -1 : 1;
      } else if (aNorm > bNorm) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  private getFieldValueAndType(
    item: any,
    field: string,
    fieldTypes: Record<string, string>
  ): { val: any; type: string } {
    const transaction = item.transaction;
    let val: any;
    const type = fieldTypes[field] || "text";

    if (field === "category.name") {
      val = transaction.category_name;
    } else if (field.startsWith("customFields.")) {
      const name = field.split(".")[1];
      val = item.customFields?.[name] || "";
    } else {
      val = transaction[field] || "";
    }

    return { val, type };
  }

  private applyOperator(
    val: any,
    operator: string,
    type: string,
    value: any,
    value2?: any
  ): boolean {
    const normVal = this.normalize(val, type);
    if (normVal === null) return false;

    const normValue = this.normalize(value, type);
    if (normValue === null) return false;

    switch (operator) {
      case "equals":
        return normVal === normValue;
      case "contains":
        return type === "text" && String(normVal).includes(String(normValue));
      case "startsWith":
        return type === "text" && String(normVal).startsWith(String(normValue));
      case "endsWith":
        return type === "text" && String(normVal).endsWith(String(normValue));
      case "gt":
        return (type === "number" || type === "date") && normVal > normValue;
      case "gte":
        return (type === "number" || type === "date") && normVal >= normValue;
      case "lt":
        return (type === "number" || type === "date") && normVal < normValue;
      case "lte":
        return (type === "number" || type === "date") && normVal <= normValue;
      case "between":
        if (!value2) return false;
        const normValue2 = this.normalize(value2, type);
        if (normValue2 === null) return false;
        return (
          (type === "number" || type === "date") &&
          normVal >= normValue &&
          normVal <= normValue2
        );
      case "in":
        if (!Array.isArray(value)) return false;
        return value.some((v) => {
          const normV = this.normalize(v, type);
          return normVal === normV;
        });
      default:
        return false;
    }
  }

  private normalize(value: any, type: string): any {
    if (value === undefined || value === null || value === "") return null;

    switch (type) {
      case "number":
        const num = parseFloat(String(value));
        return isNaN(num) ? null : num;
      case "date":
        const date = new Date(String(value));
        return isNaN(date.getTime()) ? null : date.getTime();
      case "text":
      default:
        return String(value).toLowerCase().trim();
    }
  }
}
