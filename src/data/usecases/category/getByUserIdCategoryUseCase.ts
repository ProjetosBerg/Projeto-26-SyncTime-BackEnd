import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { GetByUserIdCategoryUseCaseProtocol } from "@/data/usecases/interfaces/category/getByUserIdCategoryUseCaseProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { getByUserIdCategoryValidationSchema } from "@/data/usecases/validation/category/getByUserIdCategoryValidationSchema";

/**
 * Recupera todas as categorias pelo UserId para um usuário específico
 *
 * @param {GetByIdCategoryUseCaseProtocol.Params} data - Os dados de entrada contendo  ID do usuário
 * @param {string} data.userId - O ID do usuário proprietário da categoria
 *
 * @returns {Promise<CategoryModel>} A categoria recuperada
 *
 * @throws {ValidationError} Se o id ou userId fornecido for inválido
 * @throws {NotFoundError} Se o usuário ou a categoria não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByUserIdCategoryUseCase
  implements GetByUserIdCategoryUseCaseProtocol
{
  constructor(
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByUserIdCategoryUseCaseProtocol.Params
  ): Promise<{ categories: CategoryModel[]; total: number }> {
    try {
      let categoriesFormat: CategoryModel[] = [];

      await getByUserIdCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError("User não encontrado");
      }

      const { categories, total } = await this.categoryRepository.findByUserId({
        userId: data.userId,
        page: data.page || 1,
        limit: data.limit || 10,
        search: data.search,
        sortBy: data.sortBy || "name",
        order: data.order || "ASC",
      });

      if (categories?.length === 0) {
        throw new NotFoundError("Nenhuma categoria encontrada");
      }

      categoriesFormat = categories?.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        type: category.type,
        record_type_id: category.record_type_id || undefined,
        record_type_name: category.record_type_name || undefined,
        record_type_icone: category.record_type_icone || undefined,
        user_id: category.user_id,
        created_at: category.created_at,
        updated_at: category.updated_at,
      }));

      return { categories: categoriesFormat, total };
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
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(`Falha na busca das categorias: ${errorMessage}`);
    }
  }
}
