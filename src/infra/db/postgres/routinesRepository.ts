import {
  Between,
  ILike,
  IsNull,
  Not,
  Repository,
  getRepository,
} from "typeorm";
import { Routines } from "@/domain/entities/postgres/Routines";
import { User } from "@/domain/entities/postgres/User";
import { RoutinesRepositoryProtocol } from "../interfaces/routinesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { RoutineModel } from "@/domain/models/postgres/RoutinModel";

export class RoutinesRepository implements RoutinesRepositoryProtocol {
  private repository: Repository<Routines>;

  constructor() {
    this.repository = getRepository(Routines);
  }

  /**
   * Cria uma nova rotina no banco de dados
   * @param {RoutinesRepositoryProtocol.CreateRoutine} data - Os dados para criação da rotina
   * @param {string} data.type - Tipo da rotina
   * @param {Period} [data.period] - Período opcional da rotina
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<RoutineModel>} A rotina criada
   */
  async create(
    data: RoutinesRepositoryProtocol.CreateRoutine
  ): Promise<RoutineModel> {
    const routine = this.repository.create({
      type: data.type,
      period: data.period,
      user: { id: data.userId } as User,
      created_at: data.createdAt || new Date(),
      updated_at: new Date(),
    });

    const savedRoutine = await this.repository.save(routine);
    return {
      id: savedRoutine.id,
      type: savedRoutine.type,
      period: savedRoutine.period,
      user_id: savedRoutine.user.id,
      created_at: savedRoutine.created_at,
      updated_at: savedRoutine.updated_at,
    };
  }

  /**
   * Busca uma rotina por tipo, período e ID do usuário (excluindo ID opcional)
   * @param {RoutinesRepositoryProtocol.FindByTypeAndPeriodAndUserIdParams} data - Os dados para busca
   * @param {string} data.type - Tipo da rotina
   * @param {Period} [data.period] - Período da rotina
   * @param {string} data.userId - ID do usuário
   * @param {string} [data.excludeId] - ID a excluir da busca
   * @returns {Promise<RoutineModel | null>} A rotina encontrada ou null se não existir
   */
  async findByTypeAndPeriodAndUserId(
    data: RoutinesRepositoryProtocol.FindByTypeAndPeriodAndUserIdParams
  ): Promise<RoutineModel | null> {
    const where: any = {
      type: data.type,
      user: { id: data.userId },
      created_at: Between(data.startDate, data.endDate),
    };

    if (data.period !== undefined) {
      where.period = data.period;
    } else {
      where.period = IsNull();
    }

    if (data.excludeId) {
      where.id = Not(data.excludeId);
    }

    const routine = await this.repository.findOne({
      where,
      relations: ["user"],
    });

    if (!routine) return null;

    return {
      id: routine.id,
      type: routine.type,
      period: routine.period,
      user_id: routine.user.id,
      created_at: routine.created_at,
      updated_at: routine.updated_at,
    };
  }

  /**
   * Busca uma rotina por período, ID do usuário e range de datas (excluindo ID opcional)
   * @param {RoutinesRepositoryProtocol.FindByPeriodAndUserIdAndDateRangeParams} data - Os dados para busca
   * @param {Period} data.period - Período da rotina
   * @param {string} data.userId - ID do usuário
   * @param {Date} data.startDate - Data de início do range
   * @param {Date} data.endDate - Data de fim do range
   * @param {string} [data.excludeId] - ID a excluir da busca
   * @returns {Promise<RoutineModel | null>} A rotina encontrada ou null se não existir
   */
  async findByPeriodAndUserIdAndDateRange(
    data: RoutinesRepositoryProtocol.FindByPeriodAndUserIdAndDateRangeParams
  ): Promise<RoutineModel | null> {
    const where: any = {
      period: data.period,
      user: { id: data.userId },
      created_at: Between(data.startDate, data.endDate),
    };

    if (data.excludeId) {
      where.id = Not(data.excludeId);
    }

    const routine = await this.repository.findOne({
      where,
      relations: ["user"],
    });

    if (!routine) return null;

    return {
      id: routine.id,
      type: routine.type,
      period: routine.period,
      user_id: routine.user.id,
      created_at: routine.created_at,
      updated_at: routine.updated_at,
    };
  }

  /**
   * Busca rotinas por ID do usuário
   * @param {RoutinesRepositoryProtocol.FindByUserIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<{ routines: RoutineModel[]; total: number }>} Lista de rotinas encontradas
   */
  async findByUserId(
    data: RoutinesRepositoryProtocol.FindByUserIdParams
  ): Promise<{ routines: RoutineModel[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const search = data.search || "";
    const sortBy = data.sortBy || "type";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const whereCondition = search
      ? { type: ILike(`%${search}%`), user: { id: data.userId } }
      : { user: { id: data.userId } };

    if (data.year && data.month) {
      const startDate = new Date(data.year, data.month - 1, 1);
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59, 999);

      Object.assign(whereCondition, {
        created_at: Between(startDate, endDate),
      });
    }

    const [routines, total] = await this.repository.findAndCount({
      where: whereCondition,
      relations: ["user", "notes"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const formattedRoutines = routines.map((routine) => ({
      id: routine.id,
      type: routine.type,
      period: routine.period,
      user_id: routine.user?.id,
      notes: routine.notes || [],
      created_at: routine.created_at,
      updated_at: routine.updated_at,
    }));

    return {
      routines: formattedRoutines,
      total,
    };
  }

  /**
   * Busca uma rotina por ID e ID do usuário
   * @param {RoutinesRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID da rotina
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<RoutineModel | null>} A rotina encontrada ou null se não existir
   */
  async findByIdAndUserId(
    data: RoutinesRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<RoutineModel | null> {
    const routine = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "notes"],
    });

    if (!routine) return null;

    return {
      id: routine.id,
      type: routine.type,
      period: routine.period,
      user_id: routine.user.id,
      created_at: routine.created_at,
      updated_at: routine.updated_at,
    };
  }

  /**
   * Deleta uma rotina do banco de dados
   * @param {RoutinesRepositoryProtocol.DeleteRoutineParams} data - Os dados para deleção
   * @param {string} data.id - ID da rotina
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando a rotina não é encontrada
   */
  async deleteRoutine(
    data: RoutinesRepositoryProtocol.DeleteRoutineParams
  ): Promise<void> {
    const routine = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
    });

    if (!routine) {
      throw new NotFoundError(
        `Rotina com ID ${data.id} não encontrada para este usuário`
      );
    }

    await this.repository.delete({
      id: data.id,
      user: { id: data.userId },
    });
  }

  /**
   * Atualiza uma rotina no banco de dados
   * @param {RoutinesRepositoryProtocol.UpdateRoutineParams} data - Os dados para atualização
   * @param {string} data.id - ID da rotina
   * @param {string} [data.type] - Tipo da rotina
   * @param {Period} [data.period] - Período da rotina
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<RoutineModel>} A rotina atualizada
   * @throws {NotFoundError} Quando a rotina não é encontrada
   */
  async updateRoutine(
    data: RoutinesRepositoryProtocol.UpdateRoutineParams
  ): Promise<RoutineModel> {
    const routine = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user"],
    });

    if (!routine) {
      throw new NotFoundError(
        `Rotina com ID ${data.id} não encontrada para este usuário`
      );
    }

    if (data.type) routine.type = data.type;
    if (data.period !== undefined) routine.period = data.period;
    routine.updated_at = new Date();

    const updatedRoutine = await this.repository.save(routine);
    return {
      id: updatedRoutine.id,
      type: updatedRoutine.type,
      period: updatedRoutine.period,
      user_id: updatedRoutine.user.id,
      created_at: updatedRoutine.created_at,
      updated_at: updatedRoutine.updated_at,
    };
  }
}
