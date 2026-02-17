import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { GetByIdTransactionUseCaseProtocol } from "@/data/usecases/interfaces/transactions/getByIdTransactionUseCaseProtocol";
import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { getByIdTransactionValidationSchema } from "@/data/usecases/validation/transactions/getByIdTransactionValidationSchema";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { CustomFieldValueWithMetadata } from "./utils/customFieldValueWithMetadata";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";

/**
 * Recupera uma transação pelo seu ID para um usuário específico, enriquecida com campos customizados
 *
 * @param {GetByIdTransactionUseCaseProtocol.Params} data - Os dados de entrada para a recuperação da transação
 * @param {string} data.transactionId - O ID da transação a ser recuperada
 * @param {string} data.userId - O ID do usuário proprietário da transação
 *
 * @returns {Promise<{ transaction: TransactionModel; customFields?: CustomFieldValueWithMetadata[]; }>} A transação enriquecida com campos customizados
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, o registro mensal ou a transação não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByIdTransactionUseCase
  implements GetByIdTransactionUseCaseProtocol
{
  constructor(
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly customFieldRepository: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: GetByIdTransactionUseCaseProtocol.Params): Promise<{
    transaction: TransactionModelMock;
    customFields?: CustomFieldValueWithMetadata[];
  }> {
    try {
      await getByIdTransactionValidationSchema.validate(data, {
        abortEarly: false,
      });

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

      const monthlyRecord =
        await this.monthlyRecordRepository.findByIdAndUserId({
          id: String(transaction.monthly_record_id ?? ""),
          userId: data.userId,
        });
      if (!monthlyRecord) {
        throw new NotFoundError(
          `Registro mensal com ID ${transaction.monthly_record_id} não encontrado para este usuário`
        );
      }

      const customFieldValues =
        await this.transactionCustomFieldRepository.findByTransactionId({
          transaction_id: transaction.id,
          user_id: data.userId,
        });

      let enrichedCustomFields: CustomFieldValueWithMetadata[] = [];
      if (customFieldValues.length > 0) {
        const valueIds = customFieldValues
          .map((v) => v.custom_field_id)
          .filter((id): id is string => Boolean(id));

        const customFieldDefs =
          await this.customFieldRepository.findByIdsAndUserId({
            ids: valueIds,
            user_id: data.userId,
          });

        enrichedCustomFields = customFieldValues.map((value) => {
          const cfId = value.custom_field_id;
          if (!cfId) {
            throw new ServerError(
              `Valor de campo customizado sem custom_field_id para entry com id ${value.id}`
            );
          }

          const cfDef = customFieldDefs?.find((cf) => cf.id === cfId);
          if (!cfDef) {
            throw new ServerError(
              `Definição de campo customizado não encontrada para ID ${cfId}`
            );
          }

          return {
            id: value.id!,
            custom_field_id: cfId,
            value: value.value,
            label: cfDef.label,
            type: cfDef.type,
            required: cfDef.required,
          };
        });
      }

      return { transaction, customFields: enrichedCustomFields };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca da transação: ${errorMessage}`);
    }
  }
}
