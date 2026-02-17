import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { EditCategoryUseCaseProtocol } from "@/data/usecases/interfaces/category/editCategoryUseCaseProtocol";
import { CategoryModel } from "@/domain/models/postgres/CategoryModel";
import { editCategoryValidationSchema } from "../validation/category/editCategoryValidationSchema";

/**
 * Updates a category for a specific user
 *
 * @param {EditCategoryUseCaseProtocol.Params} data - The input data for updating the category
 * @param {string} data.categoryId - The ID of the category to update
 * @param {string} data.name - The name of the category
 * @param {string} [data.description] - The description of the category (optional)
 * @param {string} data.type - The type of the category ('expense' or 'revenue')
 * @param {number} data.recordTypeId - The ID of the associated record type
 * @param {string} data.userId - The ID of the user who owns the category
 *
 * @returns {Promise<CategoryModel>} The updated category
 *
 * @throws {ValidationError} If the provided data is invalid
 * @throws {NotFoundError} If the user, category, or record type is not found
 * @throws {BusinessRuleError} If a category with the same name already exists for the user and record type
 * @throws {ServerError} If an unexpected error occurs during update
 */
export class EditCategoryUseCase implements EditCategoryUseCaseProtocol {
  constructor(
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: EditCategoryUseCaseProtocol.Params
  ): Promise<CategoryModel> {
    try {
      await editCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const existingRecordType =
        await this.recordTypeRepository.findByIdRecordType({
          id: data.recordTypeId,
          userId: data.userId,
        });

      if (!existingRecordType) {
        throw new NotFoundError(
          `Nenhum tipo de registro encontrado com o ID ${data.recordTypeId} para este usuário`
        );
      }

      const existingCategory =
        await this.categoryRepository.findByNameAndUserId({
          name: data.name,
          userId: data.userId,
          recordTypeId: data.recordTypeId,
        });

      if (existingCategory && existingCategory.id !== data.categoryId) {
        throw new BusinessRuleError(
          `Já existe uma categoria com o nome "${data.name}" para este usuário e tipo de registro`
        );
      }

      const updatedCategory = await this.categoryRepository.updateCategory({
        id: data.categoryId || "",
        name: data.name,
        description: data.description,
        type: data.type,
        recordTypeId: data.recordTypeId || 0,
        userId: data.userId || "",
      });

      return updatedCategory;
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
        error.message || "Erro interno do servidor durante a atualização";
      throw new ServerError(
        `Falha na atualização de categoria: ${errorMessage}`
      );
    }
  }
}
