import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { EditTransactionUseCaseProtocol } from "@/data/usecases/interfaces/transactions/editTransactionUseCaseProtocol";
import { TransactionModelMock } from "@/domain/models/postgres/TransactionModel";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { editTransactionValidationSchema } from "../validation/transactions/editTransactionValidationSchema";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { validateFieldValueByType } from "./utils/validateFieldValueByType";
import { CustomFieldValueWithMetadata } from "./utils/customFieldValueWithMetadata";

/**
 * Atualiza uma transação existente para um usuário específico
 *
 * @param {EditTransactionUseCaseProtocol.Params} data - Os dados de entrada para a atualização da transação
 * @param {string} data.transactionId - O ID da transação a ser atualizada
 * @param {string} data.userId - O ID do usuário proprietário da transação
 * @param {string} [data.title] - O novo título da transação (opcional)
 * @param {string | null} [data.description] - A nova descrição da transação (opcional)
 * @param {number} [data.amount] - O novo valor da transação (opcional)
 * @param {Date} [data.transactionDate] - A nova data da transação (opcional)
 * @param {string} [data.monthlyRecordId] - O novo ID do registro mensal (opcional)
 * @param {string} [data.categoryId] - O novo ID da categoria (opcional)
 * @param {Array<{ custom_field_id: string; value: any; }>} [data.customFields] - Campos customizados opcionais para atualizar/substituir (com validação avançada de tipos)
 *
 * @returns {Promise<{ transaction: TransactionModel; customFields?: CustomFieldValueWithMetadata[]; }>} A transação atualizada e os valores de campos customizados com metadados
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, a categoria, o registro mensal ou a transação não forem encontrados
 * @throws {BusinessRuleError} Se a data da transação não estiver dentro do mês e ano do registro mensal, se custom fields forem inválidos ou se tipos de valores não coincidirem
 * @throws {ServerError} Se ocorrer um erro inesperado durante a atualização
 */

export class EditTransactionUseCase implements EditTransactionUseCaseProtocol {
  constructor(
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly customFieldRepository: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: EditTransactionUseCaseProtocol.Params): Promise<{
    transaction: TransactionModelMock;
    customFields?: CustomFieldValueWithMetadata[];
  }> {
    try {
      await editTransactionValidationSchema.validate(data, {
        abortEarly: false,
      });

      let customFields: any[] | null = [];
      let targetCategoryId = data.categoryId;
      if (data.customFields && data.customFields.length > 0) {
        if (!targetCategoryId) {
          const existingTransaction =
            await this.transactionRepository.findByIdAndUserId({
              id: data.transactionId,
              userId: data.userId,
            });
          if (!existingTransaction) {
            throw new NotFoundError(
              `Transação com ID ${data.transactionId} não encontrada para este usuário`
            );
          }
          targetCategoryId = existingTransaction.category_id;
        }

        const customFieldIds = data.customFields.map(
          (cf) => cf.custom_field_id
        );
        customFields = await this.customFieldRepository.findByIdsAndUserId({
          ids: customFieldIds,
          user_id: data.userId,
        });

        if (customFields!.length !== customFieldIds.length) {
          throw new NotFoundError(
            "Um ou mais campos customizados não encontrados para este usuário"
          );
        }

        const invalidFields = customFields!.filter(
          (cf) => cf.category_id !== targetCategoryId
        );
        if (invalidFields.length > 0) {
          throw new BusinessRuleError(
            `Campos customizados inválidos para esta categoria: ${invalidFields.map((cf) => cf.name).join(", ")}`
          );
        }

        for (const cfValue of data.customFields) {
          const cf = customFields!.find(
            (c) => c.id === cfValue.custom_field_id
          );
          if (!cf) {
            throw new NotFoundError(
              `Campo customizado com ID ${cfValue.custom_field_id} não encontrado`
            );
          }

          if (
            cf.required &&
            [null, "", undefined, "null", "undefined"].includes(cfValue.value)
          ) {
            throw new BusinessRuleError(`O campo "${cf.label}" é obrigatório`);
          }

          if (cfValue.value != null && cfValue.value !== "") {
            validateFieldValueByType(
              cf.type as FieldType,
              cfValue.value,
              cf.label,
              cf.options
            );
          }
        }
      }

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const transaction = await this.transactionRepository.findByIdAndUserId({
        id: data.transactionId,
        userId: data.userId,
      });
      if (!transaction) {
        throw new NotFoundError(
          `Transação com ID ${data.transactionId} não encontrada para este usuário`
        );
      }

      const monthlyRecordId =
        data.monthlyRecordId ?? transaction.monthly_record_id;
      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: String(monthlyRecordId),
          userId: data.userId,
        });
      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${monthlyRecordId} não encontrado para este usuário`
        );
      }

      if (data.categoryId) {
        const category = await this.categoryRepository.findByIdAndUserId({
          id: data.categoryId,
          userId: data.userId,
        });
        if (!category) {
          throw new NotFoundError(
            `Categoria com ID ${data.categoryId} não encontrada para este usuário`
          );
        }
      }

      if (data?.transactionDate) {
        const transactionDate = new Date(data.transactionDate);
        const recordMonth = monthlyRecord.month;
        const recordYear = monthlyRecord.year;
        const transactionMonth = transactionDate.getMonth() + 1;
        const transactionYear = transactionDate.getFullYear();

        if (
          transactionMonth !== recordMonth ||
          transactionYear !== recordYear
        ) {
          throw new BusinessRuleError(
            `A data da transação deve estar dentro do mês ${recordMonth} e ano ${recordYear} do registro mensal`
          );
        }
      }

      const updatedTransaction = await this.transactionRepository.update({
        id: data.transactionId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        transaction_date: data.transactionDate,
        monthly_record_id: data.monthlyRecordId,
        category_id: data.categoryId,
      });

      if (data?.customFields && data?.customFields?.length > 0) {
        await this.transactionCustomFieldRepository.deleteByTransactionId({
          transaction_id: updatedTransaction.id,
          user_id: data.userId,
        });

        for (const cf of data.customFields) {
          await this.transactionCustomFieldRepository.create({
            transaction_id: updatedTransaction.id,
            custom_field_id: cf.custom_field_id,
            value: cf.value,
            user_id: data.userId,
          });
        }
      }

      const currentCustomFieldValues =
        await this.transactionCustomFieldRepository.findByTransactionId({
          transaction_id: updatedTransaction.id,
          user_id: data.userId,
        });

      let enrichedCustomFields: CustomFieldValueWithMetadata[] | null = [];
      if (currentCustomFieldValues && currentCustomFieldValues?.length > 0) {
        const valueIds = currentCustomFieldValues
          .map((v) => v.custom_field_id)
          .filter(Boolean) as string[];
        const customFieldDefs =
          await this.customFieldRepository.findByIdsAndUserId({
            ids: valueIds,
            user_id: data.userId,
          });

        enrichedCustomFields = currentCustomFieldValues?.map((value) => {
          if (!value.custom_field_id) {
            throw new ServerError(
              `Valor de campo customizado sem custom_field_id para o registro ${value.id ?? "desconhecido"}`
            );
          }

          const cfDef = customFieldDefs!.find(
            (cf) => cf.id === value.custom_field_id
          );
          if (!cfDef) {
            throw new ServerError(
              `Definição de campo customizado não encontrada para ID ${value.custom_field_id}`
            );
          }
          return {
            id: value.id!,
            custom_field_id: value.custom_field_id,
            value: value.value,
            label: cfDef.label,
            type: cfDef.type,
            required: cfDef.required,
          };
        });
      }

      return {
        transaction: updatedTransaction,
        customFields: enrichedCustomFields,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (
        error instanceof BusinessRuleError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a atualização";
      throw new ServerError(
        `Falha na atualização da transação: ${errorMessage}`
      );
    }
  }
}
