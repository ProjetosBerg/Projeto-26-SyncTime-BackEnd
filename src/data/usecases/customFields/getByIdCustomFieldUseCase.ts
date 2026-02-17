import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { GetByIdCustomFieldUseCaseProtocol } from "@/data/usecases/interfaces/customFields/getByIdCustomFieldUseCaseProtocol";
import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";
import { getByIdCustomFieldValidationSchema } from "@/data/usecases/validation/customFields/getByIdCustomFieldValidationSchema";

/**
 * Retrieves a custom field by its ID and user ID
 *
 * @param {GetByIdCustomFieldUseCaseProtocol.Params} data - The input data for retrieving the custom field
 * @param {string} data.id - The ID of the custom field to retrieve
 * @param {string} data.user_id - The ID of the user who owns the custom field
 *
 * @returns {Promise<CustomFieldModel>} The custom field
 *
 * @throws {ValidationError} If the provided data is invalid
 * @throws {NotFoundError} If the user or custom field is not found
 * @throws {ServerError} If an unexpected error occurs during retrieval
 */
export class GetByIdCustomFieldUseCase
  implements GetByIdCustomFieldUseCaseProtocol
{
  constructor(
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByIdCustomFieldUseCaseProtocol.Params
  ): Promise<CustomFieldModel> {
    try {
      await getByIdCustomFieldValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const customField = await this.customFieldsRepository.findByIdAndUserId({
        id: data.customFieldsId,
        user_id: data.userId,
      });
      if (!customField) {
        throw new NotFoundError(
          `Campo personalizado com ID ${data.customFieldsId} não encontrado para este usuário`
        );
      }

      return customField;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(
        `Falha na busca de campo personalizado: ${errorMessage}`
      );
    }
  }
}
