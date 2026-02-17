import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { CreateTransactionUseCaseProtocol } from "@/data/usecases/interfaces/transactions/createTransactionUseCaseProtocol";
import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { createTransactionValidationSchema } from "@/data/usecases/validation/transactions/createTransactionValidationSchema";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { validateFieldValueByType } from "./utils/validateFieldValueByType";
import { CustomFieldValueWithMetadata } from "./utils/customFieldValueWithMetadata";

/**
 * Cria uma nova transação para um usuário específico e um registro mensal
 *
 * @param {CreateTransactionUseCaseProtocol.Params} data - Os dados de entrada para a criação da transação
 * @param {string} data.title - O título da transação
 * @param {string} [data.description] - A descrição da transação (opcional)
 * @param {number} data.amount - O valor da transação
 * @param {Date} data.transactionDate - A data da transação
 * @param {string} data.monthlyRecordId - O ID do registro mensal associado
 * @param {string} data.categoryId - O ID da categoria associada
 * @param {string} data.userId - O ID do usuário proprietário da transação
 * @param {Array<{ custom_field_id: string; value: any; }>} [data.customFields] - Campos customizados opcionais (com validação avançada de tipos)
 *
 * @returns {Promise<{ transaction: TransactionModel; customFields?: CustomFieldValueWithMetadata[]; }>} A transação criada e os valores de campos customizados com metadados
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, a categoria, o registro mensal ou custom fields não forem encontrados
 * @throws {BusinessRuleError} Se a data da transação não estiver dentro do mês e ano do registro mensal, se custom fields forem inválidos ou se tipos de valores não coincidirem
 * @throws {ServerError} Se ocorrer um erro inesperado durante a criação
 */

export class CreateTransactionUseCase
  implements CreateTransactionUseCaseProtocol
{
  constructor(
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly customFieldRepository: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: CreateTransactionUseCaseProtocol.Params): Promise<{
    transaction: TransactionModelMock;
    customFields?: CustomFieldValueWithMetadata[];
  }> {
    try {
      await createTransactionValidationSchema.validate(data, {
        abortEarly: false,
      });

      let customFields: any[] | null = [];
      let customFieldValuesWithMetadata:
        | CustomFieldValueWithMetadata[]
        | undefined;
      if (data.customFields && data.customFields.length > 0) {
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
          (cf) => cf.category_id !== data.categoryId
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

      const category = await this.categoryRepository.findByIdAndUserId({
        id: data.categoryId,
        userId: data.userId,
      });
      if (!category) {
        throw new NotFoundError(
          `Categoria com ID ${data.categoryId} não encontrada para este usuário`
        );
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

      const transactionDate = new Date(data.transactionDate);
      const recordMonth = monthlyRecord.month;
      const recordYear = monthlyRecord.year;
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      if (transactionMonth !== recordMonth || transactionYear !== recordYear) {
        throw new BusinessRuleError(
          `A data da transação deve estar dentro do mês ${recordMonth} e ano ${recordYear} do registro mensal`
        );
      }

      const transaction = await this.transactionRepository.create({
        title: data.title,
        description: data?.description,
        amount: data?.amount,
        transaction_date: data.transactionDate,
        monthly_record_id: data.monthlyRecordId,
        category_id: data.categoryId,
        user_id: data.userId,
      });

      if (data.customFields && data.customFields.length > 0) {
        for (const cfValue of data.customFields) {
          const savedValue = await this.transactionCustomFieldRepository.create(
            {
              transaction_id: transaction.id,
              custom_field_id: cfValue.custom_field_id,
              value: cfValue.value,
              user_id: data.userId,
            }
          );

          const cf = customFields!.find(
            (c) => c.id === cfValue.custom_field_id
          );
          if (cf) {
            customFieldValuesWithMetadata = customFieldValuesWithMetadata || [];
            customFieldValuesWithMetadata.push({
              id: savedValue.id || "",
              custom_field_id: cf.id,
              value: savedValue.value,
              label: cf.label,
              type: cf.type,
              required: cf.required,
            });
          }
        }
      }

      return { transaction, customFields: customFieldValuesWithMetadata };
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
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(`Falha no cadastro da transação: ${errorMessage}`);
    }
  }
}
