import { Repository, SelectQueryBuilder, getRepository } from "typeorm";
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
import { FilterParam } from "@/presentation/controllers/interfaces/FilterParam";

type QueryField = {
  column: string;
  type: "text" | "number" | "date";
};

export class TransactionRepository implements TransactionRepositoryProtocol {
  private repository: Repository<Transaction>;
  private readonly queryFields: Record<string, QueryField> = {
    title: { column: "transaction.title", type: "text" },
    description: { column: "transaction.description", type: "text" },
    amount: { column: "transaction.amount", type: "number" },
    transaction_date: {
      column: "transaction.transaction_date",
      type: "date",
    },
    created_at: { column: "transaction.created_at", type: "date" },
    updated_at: { column: "transaction.updated_at", type: "date" },
    "category.name": { column: "category.name", type: "text" },
  };

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

  async findPaginatedByUserIdAndMonthlyRecordId(
    data: TransactionRepositoryProtocol.FindPaginatedParams
  ): Promise<{
    transactions: TransactionModelMock[];
    total: number;
    totalAmount: number;
  }> {
    const baseQuery = this.repository
      .createQueryBuilder("transaction")
      .innerJoinAndSelect("transaction.user", "user")
      .innerJoinAndSelect("transaction.category", "category")
      .innerJoinAndSelect("transaction.monthly_record", "monthlyRecord")
      .where("user.id = :userId", { userId: data.userId })
      .andWhere("monthlyRecord.id = :monthlyRecordId", {
        monthlyRecordId: data.monthlyRecordId,
      });

    for (const [index, filter] of (data.filters || []).entries()) {
      this.applyFilter(baseQuery, filter, index);
    }

    const sortField =
      this.queryFields[data.sortBy || ""]?.column ||
      "transaction.transaction_date";
    const order = data.sortBy
      ? data.order?.toLowerCase() === "desc"
        ? "DESC"
        : "ASC"
      : "DESC";
    const pageQuery = baseQuery
      .clone()
      .orderBy(sortField, order)
      .addOrderBy("transaction.id", "ASC")
      .skip((data.page - 1) * data.limit)
      .take(data.limit);
    const totalAmountQuery = baseQuery
      .clone()
      .select("COALESCE(SUM(transaction.amount), 0)", "totalAmount")
      .orderBy();

    const [[transactions, total], amountResult] = await Promise.all([
      pageQuery.getManyAndCount(),
      totalAmountQuery.getRawOne<{ totalAmount: string }>(),
    ]);

    return {
      transactions: transactions.map((transaction) =>
        this.toModel(transaction)
      ),
      total,
      totalAmount: Number(amountResult?.totalAmount ?? 0),
    };
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
      monthly_record_id: transaction.monthly_record.id,
      category_id: transaction.category.id,
      category_name: transaction.category.name,
      user_id: transaction.user.id,
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

    await this.repository.remove(transaction);
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
    if (data.monthly_record_id !== undefined) {
      transaction.monthly_record = {
        id: data.monthly_record_id,
      } as MonthlyRecord;
    }
    if (data.category_id !== undefined) {
      transaction.category = { id: data.category_id } as Category;
    }

    const updatedTransaction = await this.repository.save(transaction);
    return updatedTransaction;
  }

  private applyFilter(
    query: SelectQueryBuilder<Transaction>,
    filter: FilterParam,
    index: number
  ): void {
    const field = this.queryFields[filter.field];
    if (!field) return;

    const parameter = `filter_${index}`;
    const secondParameter = `${parameter}_end`;
    const normalizedValue =
      field.type === "text"
        ? String(filter.value).toLowerCase().trim()
        : filter.value;

    switch (filter.operator) {
      case "equals":
        if (field.type === "text") {
          query.andWhere(
            `LOWER(COALESCE(${field.column}, '')) = :${parameter}`,
            {
              [parameter]: normalizedValue,
            }
          );
        } else if (field.type === "date") {
          query.andWhere(`DATE(${field.column}) = :${parameter}`, {
            [parameter]: filter.value,
          });
        } else {
          query.andWhere(`${field.column} = :${parameter}`, {
            [parameter]: filter.value,
          });
        }
        break;
      case "contains":
      case "startsWith":
      case "endsWith": {
        if (field.type !== "text") {
          query.andWhere("1 = 0");
          break;
        }
        const pattern =
          filter.operator === "contains"
            ? `%${normalizedValue}%`
            : filter.operator === "startsWith"
              ? `${normalizedValue}%`
              : `%${normalizedValue}`;
        query.andWhere(
          `LOWER(COALESCE(${field.column}, '')) LIKE :${parameter}`,
          {
            [parameter]: pattern,
          }
        );
        break;
      }
      case "gt":
      case "gte":
      case "lt":
      case "lte": {
        if (field.type === "text") {
          query.andWhere("1 = 0");
          break;
        }
        const operators = { gt: ">", gte: ">=", lt: "<", lte: "<=" };
        query.andWhere(
          `${field.column} ${operators[filter.operator]} :${parameter}`,
          { [parameter]: filter.value }
        );
        break;
      }
      case "between":
        if (
          field.type === "text" ||
          filter.value2 === undefined ||
          filter.value2 === null ||
          filter.value2 === ""
        ) {
          query.andWhere("1 = 0");
          break;
        }
        query.andWhere(
          `${field.column} BETWEEN :${parameter} AND :${secondParameter}`,
          {
            [parameter]: filter.value,
            [secondParameter]: filter.value2,
          }
        );
        break;
      case "in": {
        if (!Array.isArray(filter.value) || filter.value.length === 0) {
          query.andWhere("1 = 0");
          break;
        }
        const values =
          field.type === "text"
            ? filter.value.map((value) => String(value).toLowerCase().trim())
            : filter.value;
        const expression =
          field.type === "text"
            ? `LOWER(COALESCE(${field.column}, ''))`
            : field.column;
        query.andWhere(`${expression} IN (:...${parameter})`, {
          [parameter]: values,
        });
        break;
      }
    }
  }

  private toModel(transaction: Transaction): TransactionModelMock {
    return {
      id: transaction.id,
      title: transaction.title,
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      monthly_record_id: transaction.monthly_record.id,
      category_id: transaction.category.id,
      category_name: transaction.category.name,
      user_id: transaction.user.id,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }
}
