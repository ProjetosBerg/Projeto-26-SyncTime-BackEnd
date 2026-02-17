import {
  Between,
  getRepository,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { MonthlyRecord } from "@/domain/entities/postgres/MonthlyRecord";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { MonthlyRecordMock } from "@/domain/models/postgres/MonthlyRecordModel";
import { User } from "@/domain/entities/postgres/User";
import { Category } from "@/domain/entities/postgres/Category";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { FilterParam } from "@/presentation/controllers/interfaces/FilterParam";

export class MonthlyRecordRepository
  implements MonthlyRecordRepositoryProtocol
{
  private repository: Repository<MonthlyRecord>;

  constructor() {
    this.repository = getRepository(MonthlyRecord);
  }

  /**
   * Cria um novo registro mensal no banco de dados
   * @param {MonthlyRecordRepositoryProtocol.CreateMonthlyRecord} data - Os dados para criação do registro mensal
   * @param {string} data.title - Título do registro mensal
   * @param {string} [data.description] - Descrição opcional do registro mensal
   * @param {number} data.goal - Meta do registro mensal
   * @param {number} [data.initial_balance] - Saldo inicial opcional
   * @param {number} data.month - Mês do registro
   * @param {number} data.year - Ano do registro
   * @param {string} data.categoryId - ID da categoria
   * @param {string} data.userId - ID do usuário
   * @param {string} data.status - Status do registro mensal
   * @returns {Promise<MonthlyRecordMock>} O registro mensal criado
   */
  async create(
    data: MonthlyRecordRepositoryProtocol.CreateMonthlyRecord
  ): Promise<MonthlyRecordMock> {
    const monthlyRecord = this.repository.create({
      title: data.title,
      description: data.description,
      goal: data.goal,
      initial_balance: data.initial_balance ?? 0,
      month: data.month,
      year: data.year,
      status: data.status,
      category: { id: data.categoryId } as Category,
      user: { id: data.userId } as User,
    });

    const savedMonthlyRecord = await this.repository.save(monthlyRecord);
    return savedMonthlyRecord;
  }

  /**
   * Busca um registro mensal por usuário, categoria, mês e ano
   * @param {MonthlyRecordRepositoryProtocol.FindByUserIdAndCategoryIdAndMonthYearParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.categoryId - ID da categoria
   * @param {number} data.month - Mês do registro
   * @param {number} data.year - Ano do registro
   * @returns {Promise<MonthlyRecordMock | null>} O registro mensal encontrado ou null se não existir
   */
  async findOneMonthlyRecord(
    data: MonthlyRecordRepositoryProtocol.FindByUserIdAndCategoryIdAndMonthYearParams
  ): Promise<MonthlyRecordMock | null> {
    const monthlyRecord = await this.repository.findOne({
      where: {
        user: { id: data.userId },
        category: { id: data.categoryId },
        month: data.month,
        year: data.year,
      },
      relations: ["user", "category", "transactions"],
    });

    if (!monthlyRecord) return null;

    return monthlyRecord;
  }

  /**
   * Busca registros mensais por ID do usuário e categoria
   * @param {MonthlyRecordRepositoryProtocol.FindByUserIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @param {string} data.categoryId - ID da categoria
   * @returns {Promise<{ records: MonthlyRecordMock[]; total: number }>} Lista de registros mensais encontrados
   */

  async findByUserId(
    data: MonthlyRecordRepositoryProtocol.FindByUserIdParams
  ): Promise<{ records: MonthlyRecordMock[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = data.sortBy || "title";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const filters = data.filters || [];

    const whereConditions = this.buildWhereConditions(
      filters,
      data.userId || "",
      data.categoryId
    );

    const [records, total] = await this.repository.findAndCount({
      where: whereConditions,
      relations: ["user", "category", "transactions"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const mappedRecords = records.map((record) => {
      return {
        id: record.id,
        title: record.title,
        description: record.description,
        goal: record.goal,
        initial_balance: record.initial_balance,
        month: record.month,
        year: record.year,
        status: record.status,
        category_id: record.category.id,
        user_id: record.user.id,
        category: record.category,
        transactions: record.transactions || [],
        created_at: record.created_at,
        updated_at: record.updated_at,
      };
    });

    return { records: mappedRecords, total };
  }

  /**
   * Busca TODOS os registros mensais apenas por ID do usuário (sem filtro de categoria)
   * Usado para Inbox e resumos gerais
   * @param {MonthlyRecordRepositoryProtocol.FindAllByUserIdParams} data
   * @returns {Promise<{ records: MonthlyRecordMock[]; total: number }>}
   */
  async findAllByUserId(
    data: MonthlyRecordRepositoryProtocol.FindAllByUserIdParams
  ): Promise<{ records: MonthlyRecordMock[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = data.sortBy || "updated_at";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [records, total] = await this.repository.findAndCount({
      where: {
        user: { id: data.userId },
      },
      relations: ["user", "category", "transactions"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const mappedRecords = records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      goal: record.goal,
      initial_balance: record.initial_balance,
      month: record.month,
      year: record.year,
      status: record.status,
      category_id: record.category.id,
      user_id: record.user.id,
      category: record.category,
      transactions: record.transactions || [],
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));

    return { records: mappedRecords, total };
  }

  /**
   * Busca um registro mensal por ID e ID do usuário
   * @param {MonthlyRecordRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID do registro mensal
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<MonthlyRecordMock | null>} O registro mensal encontrado ou null se não existir
   */
  async findByIdAndUserId(
    data: MonthlyRecordRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<MonthlyRecordMock | null> {
    const monthlyRecord = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["category", "transactions"],
    });

    if (!monthlyRecord) return null;

    return monthlyRecord;
  }

  /**
   * Atualiza um registro mensal no banco de dados
   * @param {MonthlyRecordRepositoryProtocol.UpdateMonthlyRecord} data - Os dados para atualização
   * @param {string} data.id - ID do registro mensal
   * @param {string} data.userId - ID do usuário
   * @param {string} [data.title] - Título do registro mensal
   * @param {string} [data.description] - Descrição do registro mensal
   * @param {number} [data.goal] - Meta do registro mensal
   * @param {number} [data.initial_balance] - Saldo inicial
   * @param {string} [data.categoryId] - ID da categoria
   * @param {string} [data.status] - Status do registro mensal
   * @returns {Promise<MonthlyRecordMock>} O registro mensal atualizado
   * @throws {NotFoundError} Quando o registro mensal não é encontrado
   */
  async update(
    data: MonthlyRecordRepositoryProtocol.UpdateMonthlyRecord
  ): Promise<MonthlyRecordMock> {
    const monthlyRecord = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "category", "transactions"],
    });

    if (!monthlyRecord) {
      throw new NotFoundError(
        `Registro mensal com ID ${data.id} não encontrado para este usuário`
      );
    }

    const updatedData: Partial<MonthlyRecord> = {};

    if (data?.title) updatedData.title = data.title;
    if (data?.description) updatedData.description = data.description;
    if (data?.goal) updatedData.goal = data.goal;
    if (data?.initial_balance)
      updatedData.initial_balance = data.initial_balance;
    if (data?.status) updatedData.status = data.status;

    await this.repository.update(
      { id: data.id, user: { id: data.userId } },
      updatedData
    );

    const updatedMonthlyRecord = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["category", "transactions"],
    });

    if (!updatedMonthlyRecord) {
      throw new NotFoundError(
        `Registro mensal com ID ${data.id} não encontrado após atualização`
      );
    }

    return updatedMonthlyRecord;
  }

  /**
   * Deleta um registro mensal do banco de dados
   * @param {MonthlyRecordRepositoryProtocol.DeleteMonthlyRecordParams} data - Os dados para deleção
   * @param {string} data.id - ID do registro mensal
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando o registro mensal não é encontrado
   */
  async delete(
    data: MonthlyRecordRepositoryProtocol.DeleteMonthlyRecordParams
  ): Promise<void> {
    const monthlyRecord = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
    });

    if (!monthlyRecord) {
      throw new NotFoundError(
        `Registro mensal com ID ${data.id} não encontrado para este usuário`
      );
    }

    await this.repository.delete({
      id: data.id,
      user: { id: data.userId },
    });
  }

  private getOperatorValue(operator: string, value: any, value2?: any): any {
    const isDateString = (val: any): boolean => {
      return typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val);
    };

    const getDateRange = (dateStr: string) => {
      const startOfDay = new Date(dateStr + "T00:00:00");
      const endOfDay = new Date(dateStr + "T23:59:59.999");

      return { startOfDay, endOfDay };
    };

    switch (operator) {
      case "equals":
        if (isDateString(value)) {
          const { startOfDay, endOfDay } = getDateRange(value);
          return Between(startOfDay, endOfDay);
        }
        return value;

      case "contains":
        return ILike(`%${value}%`);

      case "startsWith":
        return Like(`${value}%`);

      case "endsWith":
        return Like(`%${value}`);

      case "gt":
        if (isDateString(value)) {
          const { endOfDay } = getDateRange(value);
          return MoreThan(endOfDay);
        }
        return MoreThan(value);

      case "gte":
        if (isDateString(value)) {
          const { startOfDay } = getDateRange(value);
          return MoreThanOrEqual(startOfDay);
        }
        return MoreThanOrEqual(value);

      case "lt":
        if (isDateString(value)) {
          const { startOfDay } = getDateRange(value);
          return LessThan(startOfDay);
        }
        return LessThan(value);

      case "lte":
        if (isDateString(value)) {
          const { endOfDay } = getDateRange(value);
          return LessThanOrEqual(endOfDay);
        }
        return LessThanOrEqual(value);

      case "between":
        if (!value2) {
          throw new Error('Operador "between" requer value2');
        }
        if (isDateString(value) && isDateString(value2)) {
          const { startOfDay } = getDateRange(value);
          const { endOfDay } = getDateRange(value2);
          return Between(startOfDay, endOfDay);
        }
        return Between(value, value2);

      case "in":
        if (!Array.isArray(value)) {
          throw new Error('Operador "in" requer um array');
        }
        return In(value);

      default:
        return value;
    }
  }

  private buildWhereConditions(
    filters: FilterParam[],
    userId: string,
    categoryId?: string
  ): any {
    const whereConditions: any = {
      user: { id: userId },
    };

    if (categoryId) {
      whereConditions.category = { id: categoryId };
    }

    const fieldMapping: Record<string, string> = {
      "category.name": "category",
      "user.name": "user",
      title: "title",
      description: "description",
      goal: "goal",
      initial_balance: "initial_balance",
      month: "month",
      year: "year",
      status: "status",
      created_at: "created_at",
      updated_at: "updated_at",
    };

    filters.forEach((filter) => {
      const { field, operator, value, value2 } = filter;

      if (!fieldMapping[field] && !field.includes(".")) {
        return;
      }

      if (field.includes(".")) {
        const [relation, relField] = field.split(".");
        if (!whereConditions[relation]) {
          whereConditions[relation] = {};
        }
        whereConditions[relation][relField] = this.getOperatorValue(
          operator,
          value,
          value2
        );
      } else {
        whereConditions[field] = this.getOperatorValue(operator, value, value2);
      }
    });

    return whereConditions;
  }
}
