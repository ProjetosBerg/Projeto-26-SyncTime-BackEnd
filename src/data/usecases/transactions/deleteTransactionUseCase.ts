import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { DeleteTransactionUseCaseProtocol } from "@/data/usecases/interfaces/transactions/deleteTransactionUseCaseProtocol";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { deleteTransactionValidationSchema } from "../validation/transactions/deleteTransactionValidationSchema";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";

/**
 * Exclui uma transação pelo seu ID para um usuário específico, incluindo seus valores de campos customizados associados
 *
 * @param {DeleteTransactionUseCaseProtocol.Params} data - Os dados de entrada para a exclusão da transação
 * @param {string} data.transactionId - O ID da transação a ser excluída
 * @param {string} data.userId - O ID do usuário proprietário da transação
 *
 * @returns {Promise<void>} É resolvida quando a transação e seus campos customizados são excluídos com sucesso
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário, o registro mensal ou a transação não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
 */

export class DeleteTransactionUseCase
  implements DeleteTransactionUseCaseProtocol
{
  constructor(
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol
  ) {}

  async handle(data: DeleteTransactionUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteTransactionValidationSchema.validate(data, {
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
          `Registro mensal com ID ${transaction?.monthly_record_id} não encontrado para este usuário`
        );
      }

      await this.transactionCustomFieldRepository.deleteByTransactionId({
        transaction_id: data.transactionId,
        user_id: data.userId,
      });

      await this.transactionRepository.delete({
        id: data.transactionId,
        userId: data.userId,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(`Falha ao deletar a transação: ${errorMessage}`);
    }
  }
}
