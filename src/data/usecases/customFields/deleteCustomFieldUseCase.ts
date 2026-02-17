import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { DeleteCustomFieldUseCaseProtocol } from "@/data/usecases/interfaces/customFields/deleteCustomFieldUseCaseProtocol";
import { deleteCustomFieldValidationSchema } from "@/data/usecases/validation/customFields/deleteCustomFieldValidationSchema";

/**
 * Exclui um campo personalizado pelo seu ID e ID do usuário
 *
 * @param {DeleteCustomFieldUseCaseProtocol.Params} data - Os dados de entrada para excluir o campo personalizado
 * @param {string} data.customFieldsId - O ID do campo personalizado a ser excluído
 * @param {string} data.userId - O ID do usuário proprietário do campo personalizado
 *
 * @returns {Promise<void>} Uma promessa que é resolvida quando o campo personalizado é excluído
 *
 * @throws {ValidationError} Se os dados fornecidos forem inválidos
 * @throws {NotFoundError} Se o usuário ou o campo personalizado não for encontrado
 * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
 */

export class DeleteCustomFieldUseCase
  implements DeleteCustomFieldUseCaseProtocol
{
  constructor(
    private readonly customFieldsRepository: CustomFieldsRepositoryProtocol,
    private readonly userRepository: UserRepositoryProtocol
  ) {}

  async handle(data: DeleteCustomFieldUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteCustomFieldValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({
        id: data.userId,
      });
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

      await this.customFieldsRepository.delete({
        id: data.customFieldsId,
        user_id: data.userId,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(
        `Falha ao deletar campo personalizado: ${errorMessage}`
      );
    }
  }
}
