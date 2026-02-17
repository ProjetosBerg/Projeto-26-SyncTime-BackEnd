import { Repository, getRepository } from "typeorm";
import { Transaction } from "@/domain/entities/postgres/Transaction";
import {
  TransactionModel,
  TransactionModelMock,
} from "@/domain/models/postgres/TransactionModel";
import { User } from "@/domain/entities/postgres/User";
import { Category } from "@/domain/entities/postgres/Category";
import { MonthlyRecord } from "@/domain/entities/postgres/MonthlyRecord";
import { TransactionRepositoryProtocol } from "../interfaces/transactionRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class TransactionRepository implements TransactionRepositoryProtocol {
  private repository: Repository<Transaction>;

  constructor() {
    this.repository = getRepository(Transaction);
  }

  /**
   * Cria uma nova transação no banco de dados
   * @param {TransactionRepositoryProtocol.CreateTransactionParams} data - Os dados para criação da transação
   * @param {string} data.title - Título da transação
   * @param {string} [data.description] - Descrição opcional da transação
   * @param {number} [data.amount] - Valor da transação
   * @param {Date} data.transaction_date - Data da transação
   * @param {string} data.monthly_record_id - ID do registro mensal
   * @param {string} data.category_id - ID da categoria
   * @param {string} data.user_id - ID do usuário
   * @returns {Promise<TransactionModelMock>} A transação criada
   */
  async create(
    data: TransactionRepositoryProtocol.CreateTransactionParams
  ): Promise<TransactionModelMock> {
    const transaction = this.repository.create({
      title: data.title,
      description: data.description,
      amount: data.amount,
      transaction_date: data.transaction_date,
      monthly_record: { id: data.monthly_record_id } as MonthlyRecord,
      category: { id: data.category_id } as Category,
      user: { id: data.user_id } as User,
    });

    const savedTransaction = await this.repository.save(transaction);
    return savedTransaction;
  }

  /**
   * Busca transações por ID do usuário e ID do registro mensal
   * @param {TransactionRepositoryProtocol.FindByUserAndMonthlyRecordIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.monthlyRecordId - ID do registro mensal
   * @returns {Promise<TransactionModelMock[]>} Lista de transações encontradas
   */
  async findByUserIdAndMonthlyRecordId(
    data: TransactionRepositoryProtocol.FindByUserAndMonthlyRecordIdParams
  ): Promise<TransactionModelMock[]> {
    const transactions = await this.repository.find({
      where: {
        user: { id: data.userId },
        monthly_record: { id: data.monthlyRecordId },
      },
      relations: ["user", "category", "monthly_record"],
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      description: transaction?.description,
      amount: transaction?.amount,
      transaction_date: transaction.transaction_date,
      monthly_record_id: transaction.monthly_record.id,
      category_id: transaction.category.id,
      category_name: transaction.category.name,
      user_id: transaction.user.id,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }));
  }

  /**
   * Busca uma transação por ID e ID do usuário
   * @param {TransactionRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID da transação
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<TransactionModelMock | null>} A transação encontrada ou null se não existir
   */
  async findByIdAndUserId(
    data: TransactionRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<TransactionModelMock | null> {
    const transaction = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "category", "monthly_record"],
    });

    if (!transaction) return null;

    return {
      ...transaction,
      monthly_record_id: transaction?.monthly_record!.id,
    };
  }

  /**
   * Deleta uma transação do banco de dados
   * @param {TransactionRepositoryProtocol.DeleteTransactionParams} data - Os dados para deleção
   * @param {string} data.id - ID da transação
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando a transação não é encontrada
   */
  async delete(
    data: TransactionRepositoryProtocol.DeleteTransactionParams
  ): Promise<void> {
    const transaction = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
    });

    if (!transaction) {
      throw new NotFoundError(
        `Transação com ID ${data.id} não encontrada para este usuário`
      );
    }

    await this.repository.delete({
      id: data.id,
      user: { id: data.userId },
    });
  }

  /**
   * Atualiza uma transação no banco de dados
   * @param {TransactionRepositoryProtocol.UpdateTransactionParams} data - Os dados para atualização
   * @param {string} data.id - ID da transação
   * @param {string} data.userId - ID do usuário
   * @param {string} [data.title] - Título da transação
   * @param {string} [data.description] - Descrição da transação
   * @param {number} [data.amount] - Valor da transação
   * @param {Date} [data.transaction_date] - Data da transação
   * @param {string} [data.monthly_record_id] - ID do registro mensal
   * @param {string} [data.category_id] - ID da categoria
   * @returns {Promise<TransactionModelMock>} A transação atualizada
   * @throws {NotFoundError} Quando a transação não é encontrada
   */
  async update(
    data: TransactionRepositoryProtocol.UpdateTransactionParams
  ): Promise<TransactionModelMock> {
    const transaction = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["category", "monthly_record"],
    });

    if (!transaction) {
      throw new NotFoundError(
        `Transação com ID ${data.id} não encontrada para este usuário`
      );
    }

    if (data.title !== undefined) transaction.title = data.title;
    if (data.description !== undefined)
      transaction.description = data.description;
    if (data.amount !== undefined) transaction.amount = data.amount;
    if (data.transaction_date !== undefined)
      transaction.transaction_date = data.transaction_date;

    const updatedTransaction = await this.repository.save(transaction);
    return updatedTransaction;
  }
}
