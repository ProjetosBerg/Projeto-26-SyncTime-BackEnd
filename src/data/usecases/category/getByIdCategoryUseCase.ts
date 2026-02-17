import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { getByIdCategoryValidationSchema } from "../validation/category/getByIdCategoryValidationSchema";
import { GetByIdCategoryUseCaseProtocol } from "../interfaces/category/getByIdCategoryUseCaseProtocol";

/**
 * Recupera uma categoria pelo ID para um usuário específico
 *
 * @param {GetByIdCategoryUseCaseProtocol.Params} data - Os dados de entrada contendo o ID da categoria e o ID do usuário
 * @param {string} data.categoryId - O ID da categoria a ser recuperada
 * @param {string} data.userId - O ID do usuário proprietário da categoria
 *
 * @returns {Promise<CategoryModel>} A categoria recuperada
 *
 * @throws {ValidationError} Se o id ou userId fornecido for inválido
 * @throws {NotFoundError} Se o usuário ou a categoria não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a recuperação
 */

export class GetByIdCategoryUseCase implements GetByIdCategoryUseCaseProtocol {
  constructor(
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdCategoryUseCaseProtocol.Params
  ): Promise<CategoryModel> {
    try {
      await getByIdCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({
        id: String(data.userId),
      });

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

      return category;
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
