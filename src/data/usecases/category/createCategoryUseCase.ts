import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { CreateCategoryUseCaseProtocol } from "@/data/usecases/interfaces/category/createCategoryUseCaseProtocol";
import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { createCategoryValidationSchema } from "@/data/usecases/validation/category/createCategoryValidationSchema";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";

/**
 * Cria uma nova categoria para um usuário
 *
 * @param {CreateCategoryUseCaseProtocol.Params} data - Os dados de entrada para a criação da categoria
 * @param {string} data.name - O nome da categoria
 * @param {string} [data.description] - A descrição da categoria (opcional)
 * @param {string} data.type - O tipo da categoria ('expense' para despesa ou 'revenue' para receita)
 * @param {number} data.recordTypeId - O ID do tipo de registro associado
 * @param {string} data.userId - O ID do usuário proprietário da categoria
 *
 * @returns {Promise<CategoryModel>} A categoria criada
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {BusinessRuleError} Se já existir uma categoria com o mesmo nome para o usuário e tipo de registro
 * @throws {ServerError} Se ocorrer um erro inesperado durante a criação
 */

export class CreateCategoryUseCase implements CreateCategoryUseCaseProtocol {
  constructor(
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(
    data: CreateCategoryUseCaseProtocol.Params
  ): Promise<CategoryModel> {
    try {
      await createCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingrecordType =
        await this.recordTypeRepository.findByIdRecordType({
          id: data.recordTypeId,
          userId: data.userId,
        });

      if (!existingrecordType) {
        throw new BusinessRuleError(
          `Nenhum tipo de registro encontrado com o ID ${data.recordTypeId} para este usuário`
        );
      }

      const existingCategory =
        await this.categoryRepository.findByNameAndUserId({
          name: data.name,
          userId: data.userId,
          recordTypeId: data.recordTypeId,
        });

      if (existingCategory) {
        throw new BusinessRuleError(
          `Já existe uma categoria com o nome "${data.name}" para este usuário e tipo de registro`
        );
      }

      const createdCategory = await this.categoryRepository.create({
        name: data.name,
        description: data.description,
        type: data.type,
        recordTypeId: data.recordTypeId,
        userId: data.userId,
      });

      return createdCategory;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(`Falha no cadastro de categoria: ${errorMessage}`);
    }
  }
}
