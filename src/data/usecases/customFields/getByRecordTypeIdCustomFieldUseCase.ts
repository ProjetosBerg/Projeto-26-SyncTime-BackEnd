import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CustomFieldModel } from "@/domain/models/mongo/CustomFieldModel";
import { getByUserIdCustomFieldValidationSchema } from "@/data/usecases/validation/customFields/getByUserIdCustomFieldValidationSchema";
import { GetByRecordTypeIdCustomFieldUseCaseProtocol } from "../interfaces/customFields/getByRecordTypeIdCustomFieldUseCaseProtocol";

/**
 * Retrieves all custom fields for a specific user
 *
 * @param {GetByRecordTypeIdCustomFieldUseCaseProtocol.Params} data - The input data for retrieving custom fields
 * @param {string} data.user_id - The ID of the user whose custom fields are to be retrieved
 * @param {string} data.recordTypeId - The ID of the record type whose custom fields are to be retrieved
 * @param {string} data.categoryId - The ID of the category whose custom fields are to be retrieved
 *
 * @returns {Promise<CustomFieldModel[]>} An array of custom fields
 *
 * @throws {ValidationError} If the provided data is invalid
 * @throws {NotFoundError} If the user is not found
 * @throws {ServerError} If an unexpected error occurs during retrieval
 */
export class GetByRecordTypeIdCustomFieldUseCase
  implements GetByRecordTypeIdCustomFieldUseCaseProtocol
{
  constructor(
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(
    data: GetByRecordTypeIdCustomFieldUseCaseProtocol.Params
  ): Promise<{ customFields: CustomFieldModel[]; total: number }> {
    try {
      await getByUserIdCustomFieldValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }

      const { customFields, total } =
        await this.customFieldsRepository.findByRecordTypeId({
          user_id: data.userId,
          record_type_id: data.recordTypeId,
          category_id: data.categoryId,
        });
      return { customFields, total };
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
        `Falha na busca de campos personalizados: ${errorMessage}`
      );
    }
  }
}
