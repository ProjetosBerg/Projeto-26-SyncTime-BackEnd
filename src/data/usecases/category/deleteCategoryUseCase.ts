import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { deleteCategoryValidationSchema } from "@/data/usecases/validation/category/deleteCategoryValidationSchema";
import { DeleteCategoryUseCaseProtocol } from "@/data/usecases/interfaces/category/deleteCategoryUseCaseProtocol";

/**
 * Exclui uma categoria pelo ID para um usuário específico
 *
 * @param {DeleteCategoryUseCaseProtocol.Params} data - Os dados de entrada contendo o ID da categoria e o ID do usuário
 * @param {string} data.categoryId - O ID da categoria a ser excluída
 * @param {string} data.userId - O ID do usuário proprietário da categoria
 *
 * @returns {Promise<void>} Uma promessa que é resolvida quando a categoria é excluída
 *
 * @throws {ValidationError} Se o id ou userId fornecido for inválido
 * @throws {NotFoundError} Se o usuário ou a categoria não forem encontrados
 * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
 */

export class DeleteCategoryUseCase implements DeleteCategoryUseCaseProtocol {
  constructor(
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(data: DeleteCategoryUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({
        id: String(data.userId),
      });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      await this.categoryRepository.deleteCategory({
        id: data.categoryId,
        userId: data.userId,
      });
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
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(`Falha ao deletar categoria: ${errorMessage}`);
    }
  }
}
