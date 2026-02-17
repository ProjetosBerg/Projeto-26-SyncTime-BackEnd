import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { FindUserByIdUseCaseProtocol } from "../interfaces/users/findUserByIdUseCaseProtocol";
import { findUserByIdValidationSchema } from "../validation/users/findUserByIdValidationSchema";

export class FindUserByIdUseCase implements FindUserByIdUseCaseProtocol {
  constructor(private readonly userRepository: UserRepositoryProtocol) {}

  /**
   * Busca um usuário específico pelo seu ID e verifica se possui perguntas de segurança
   * @param {FindUserByIdUseCaseProtocol.Params} data - Os dados necessários para buscar o usuário
   * @param {string} data.id - O ID do usuário a ser buscado
   * @returns {Promise<FindUserByIdUseCaseProtocol.Result>} Os dados completos do usuário encontrado
   * @throws {ValidationError} Se os dados fornecidos não passarem na validação
   * @throws {NotFoundError} Se o usuário não for encontrado
   * @throws {BusinessRuleError} Se o usuário não possuir perguntas de segurança registradas
   * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
   */
  async handle(
    data: FindUserByIdUseCaseProtocol.Params
  ): Promise<FindUserByIdUseCaseProtocol.Result> {
    try {
      await findUserByIdValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ id: data?.id });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      if (!user?.security_questions || user?.security_questions.length === 0) {
        throw new BusinessRuleError(
          "Nenhuma questão de segurança registrada para este usuário"
        );
      }

      const returnUser = {
        ...user,
        id: user.id!,
        security_questions: user.security_questions.map((q) => ({
          question: String(q.question),
        })),
        password: undefined,
      };

      return { user: returnUser };
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
        `Falha na Busca do Usuário pelo Id: ${errorMessage}`
      );
    }
  }
}
