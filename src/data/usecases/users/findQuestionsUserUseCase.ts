import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { FindQuestionsUserUseCaseProtocol } from "../interfaces/users/findQuestionsUserUseCaseProtocol";
import { findQuestionsUserValidationSchema } from "../validation/users/findQuestionsUserValidationSchema";

/**
 * Busca as perguntas de segurança de um usuário específico pelo seu login
 * @param {FindQuestionsUserUseCaseProtocol.Params} data - Os dados necessários para buscar as perguntas de segurança
 * @param {string} data.login - O login do usuário para buscar as perguntas de segurança
 * @returns {Promise<FindQuestionsUserUseCaseProtocol.Result>} Array com as perguntas de segurança do usuário
 * @throws {ValidationError} Se os dados fornecidos não passarem na validação
 * @throws {NotFoundError} Se o usuário não for encontrado
 * @throws {BusinessRuleError} Se o usuário não possuir perguntas de segurança registradas
 * @throws {ServerError} Se ocorrer um erro inesperado durante a busca
 */
export class FindQuestionsUserUseCase
  implements FindQuestionsUserUseCaseProtocol
{
  constructor(private readonly userRepository: UserRepositoryProtocol) {}

  async handle(
    data: FindQuestionsUserUseCaseProtocol.Params
  ): Promise<FindQuestionsUserUseCaseProtocol.Result> {
    try {
      await findQuestionsUserValidationSchema.validate(data, {
        abortEarly: false,
      });

      const user = await this.userRepository.findOne({ login: data.login });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      if (!user?.security_questions || user?.security_questions.length === 0) {
        throw new BusinessRuleError(
          "Nenhuma questão de segurança registrada para este usuário"
        );
      }

      const securityQuestions = user?.security_questions.map((q) => ({
        question: q.question,
      }));
      return { securityQuestions };
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
      throw new ServerError(`Falha na Busca de Questões: ${errorMessage}`);
    }
  }
}
