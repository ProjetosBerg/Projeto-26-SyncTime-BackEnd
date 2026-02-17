import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { DeleteUserByIdUseCaseProtocol } from "../interfaces/users/deleteUserByIdUseCaseProtocol";
import { deleteUserByIdValidationSchema } from "../validation/users/deleteUserByIdValidationSchema";

export class DeleteUserByIdUseCase implements DeleteUserByIdUseCaseProtocol {
  constructor(private readonly userRepository: UserRepositoryProtocol) {}

  /**
   * Deleta um usuário específico pelo seu ID
   * @param {DeleteUserByIdUseCaseProtocol.Params} data - Os dados necessários para deletar o usuário
   * @param {string} data.id - O ID do usuário a ser deletado
   * @returns {Promise<DeleteUserByIdUseCaseProtocol.Result>} Mensagem de confirmação da exclusão
   * @throws {ValidationError} Se os dados fornecidos não passarem na validação
   * @throws {NotFoundError} Se o usuário não for encontrado
   * @throws {BusinessRuleError} Se houver violação de regra de negócio
   * @throws {ServerError} Se ocorrer um erro inesperado durante a exclusão
   */
  async handle(
    data: DeleteUserByIdUseCaseProtocol.Params
  ): Promise<DeleteUserByIdUseCaseProtocol.Result> {
    try {
      await deleteUserByIdValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data?.id });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      await this.userRepository.deleteUser({ id: data?.id });

      return { message: "Usuário deletado com sucesso" };
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
        error.message ||
        "Erro interno do servidor durante a redefinição de senha";
      throw new ServerError(
        `Falha ao Deletar o Usuário pelo Id: ${errorMessage}`
      );
    }
  }
}
