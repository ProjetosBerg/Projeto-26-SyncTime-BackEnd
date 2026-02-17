import { ILike, Repository, getRepository } from "typeorm";
import { Category } from "@/domain/entities/postgres/Category";
import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { User } from "@/domain/entities/postgres/User";
import { RecordTypes } from "@/domain/entities/postgres/RecordTypes";
import {
  CategoryModelWithRecordType,
  CategoryRepositoryProtocol,
} from "../interfaces/categoryRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class CategoryRepository implements CategoryRepositoryProtocol {
  private repository: Repository<Category>;

  constructor() {
    this.repository = getRepository(Category);
  }

  /**
   * Cria uma nova categoria no banco de dados
   * @param {CategoryRepositoryProtocol.CreateCategory} data - Os dados para criação da categoria
   * @param {string} data.name - Nome da categoria
   * @param {string} [data.description] - Descrição opcional da categoria
   * @param {string} data.type - Tipo da categoria
   * @param {number} data.recordTypeId - ID do tipo de registro
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<CategoryModel>} A categoria criada
   */
  async create(
    data: CategoryRepositoryProtocol.CreateCategory
  ): Promise<CategoryModel> {
    const category = this.repository.create({
      name: data.name,
      description: data.description,
      type: data.type,
      record_type: { id: data.recordTypeId } as RecordTypes,
      user: { id: data.userId } as User,
    });

    const savedCategory = await this.repository.save(category);
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      description: savedCategory.description,
      type: savedCategory.type,
      record_type_id: savedCategory.record_type.id,
      user_id: savedCategory.user.id,
      monthly_records: savedCategory?.monthly_records || [],
      transactions: savedCategory?.transactions || [],
      created_at: savedCategory.created_at,
      updated_at: savedCategory.updated_at,
    };
  }

  /**
   * Busca uma categoria por nome, usuário e tipo de registro
   * @param {CategoryRepositoryProtocol.FindByNameAndUserIdParams} data - Os dados para busca
   * @param {string} data.name - Nome da categoria
   * @param {string} data.userId - ID do usuário
   * @param {number} data.recordTypeId - ID do tipo de registro
   * @returns {Promise<CategoryModel | null>} A categoria encontrada ou null se não existir
   */
  async findByNameAndUserId(
    data: CategoryRepositoryProtocol.FindByNameAndUserIdParams
  ): Promise<CategoryModel | null> {
    const category = await this.repository.findOne({
      where: {
        name: data.name,
        user: { id: data.userId },
        record_type: { id: data.recordTypeId },
      },
      relations: ["user", "record_type", "monthly_records", "transactions"],
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      record_type_id: category.record_type.id,
      user_id: category.user.id,
      monthly_records: category.monthly_records || [],
      transactions: category.transactions || [],
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  /**
   * Busca categorias por ID do usuário
   * @param {CategoryRepositoryProtocol.FindByUserIdParams} data - Os dados para busca
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<Category[]>} Lista de categorias encontradas
   */

  async findByUserId(
    data: CategoryRepositoryProtocol.FindByUserIdParams
  ): Promise<{ categories: CategoryModelWithRecordType[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const offset = (page - 1) * limit;
    const search = data.search || "";
    const sortBy = data.sortBy || "name";
    const order = data.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const whereCondition = search
      ? { name: ILike(`%${search}%`), user: { id: data.userId } }
      : { user: { id: data.userId } };

    const [categories, total] = await this.repository.findAndCount({
      where: whereCondition,
      relations: ["record_type", "user"],
      take: limit,
      skip: offset,
      order: { [sortBy]: order },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      record_type_id: category.record_type?.id || undefined,
      record_type_name: category.record_type?.name || undefined,
      record_type_icone: category.record_type?.icone || undefined,
      user_id: category.user?.id,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));

    return {
      categories: formattedCategories,
      total,
    };
  }

  /**
   * Busca uma categoria por ID e ID do usuário
   * @param {CategoryRepositoryProtocol.FindByIdAndUserIdParams} data - Os dados para busca
   * @param {string} data.id - ID da categoria
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<CategoryModel | null>} A categoria encontrada ou null se não existir
   */

  async findByIdAndUserId(
    data: CategoryRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<CategoryModel | null> {
    const category = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "record_type", "monthly_records", "transactions"],
    });

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      record_type_id: category.record_type.id,
      record_type_name: category.record_type.name,
      user_id: category.user.id,
      monthly_records: category.monthly_records || [],
      transactions: category.transactions || [],
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  /**
   * Deleta uma categoria do banco de dados
   * @param {CategoryRepositoryProtocol.DeleteCategoryParams} data - Os dados para deleção
   * @param {string} data.id - ID da categoria
   * @param {string} data.userId - ID do usuário
   * @returns {Promise<void>} Não retorna valor
   * @throws {NotFoundError} Quando a categoria não é encontrada
   */

  async deleteCategory(
    data: CategoryRepositoryProtocol.DeleteCategoryParams
  ): Promise<void> {
    const category = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
    });

    if (!category) {
      throw new NotFoundError(
        `Categoria com ID ${data.id} não encontrada para este usuário`
      );
    }

    await this.repository.delete({
      id: data.id,
      user: { id: data.userId },
    });
  }

  /**
   * Atualiza uma categoria no banco de dados
   * @param {CategoryRepositoryProtocol.UpdateCategoryParams} data - Os dados para atualização
   * @param {string} data.id - ID da categoria
   * @param {string} data.userId - ID do usuário
   * @param {string} [data.name] - Nome da categoria
   * @param {string} [data.description] - Descrição da categoria
   * @param {string} [data.type] - Tipo da categoria
   * @param {number} data.recordTypeId - ID do tipo de registro
   * @returns {Promise<CategoryModel>} A categoria atualizada
   * @throws {NotFoundError} Quando a categoria não é encontrada
   */
  async updateCategory(
    data: CategoryRepositoryProtocol.UpdateCategoryParams
  ): Promise<CategoryModel> {
    const category = await this.repository.findOne({
      where: {
        id: data.id,
        user: { id: data.userId },
      },
      relations: ["user", "record_type", "monthly_records", "transactions"],
    });

    if (!category) {
      throw new NotFoundError(
        `Categoria com ID ${data.id} não encontrada para este usuário`
      );
    }

    if (data.name) category.name = data.name;
    if (data.description) category.description = data.description || "";
    if (data.type) category.type = data.type;
    if (data.recordTypeId)
      category.record_type = { id: data.recordTypeId } as RecordTypes;
    category.updated_at = new Date();

    const updatedCategory = await this.repository.save(category);
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      type: updatedCategory.type,
      record_type_id: updatedCategory.record_type.id,
      user_id: updatedCategory.user.id,
      monthly_records: updatedCategory.monthly_records || [],
      transactions: updatedCategory.transactions || [],
      created_at: updatedCategory.created_at,
      updated_at: updatedCategory.updated_at,
    };
  }
}
