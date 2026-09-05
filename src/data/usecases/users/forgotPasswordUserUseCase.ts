import { UserModel } from "@/domain/models/postgres/UserModel";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ForgotPasswordUserUseCaseProtocol } from "../interfaces/users/forgotPasswordUseCaseProtocol";
import { forgotPasswordUserValidationSchema } from "../validation/users/forgotPasswordUserValidationSchema";
import { UnauthorizedError } from "@/data/errors/UnauthorizedError";

const INVALID_RECOVERY_MESSAGE = "Dados de recuperação inválidos";
const FAKE_SECURITY_ANSWER_HASH =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export class ForgotPasswordUserUseCase
  implements ForgotPasswordUserUseCaseProtocol
{
  constructor(
    private readonly userRepository: UserRepositoryProtocol,
    private readonly userAuth: UserAuth
  ) {}

  /**
   * Redefine a senha de um usuário através da validação das perguntas de segurança
   * @param {ForgotPasswordUserUseCaseProtocol.Params} data - Os dados necessários para redefinir a senha
   * @param {string} data.login - O login do usuário que deseja redefinir a senha
   * @param {string} data.newPassword - A nova senha a ser definida
   * @param {string} data.confirmNewPassword - A confirmação da nova senha
   * @param {Array<{question: string, answer: string}>} data.securityQuestions - As perguntas de segurança com suas respectivas respostas
   * @returns {Promise<ForgotPasswordUserUseCaseProtocol.Result>} Mensagem de confirmação da redefinição da senha
   * @throws {ValidationError} Se os dados fornecidos não passarem na validação
   * @throws {NotFoundError} Se o usuário não for encontrado
   * @throws {BusinessRuleError} Se o usuário não possuir perguntas de segurança, se o número de questões não corresponder, se as respostas estiverem incorretas ou se houver falha na atualização
   * @throws {ServerError} Se ocorrer um erro inesperado durante a redefinição
   */
  async handle(
    data: ForgotPasswordUserUseCaseProtocol.Params
  ): Promise<ForgotPasswordUserUseCaseProtocol.Result> {
    try {
      await forgotPasswordUserValidationSchema.validate(data, {
        abortEarly: false,
      });
      const user = await this.userRepository.findOne({ login: data.login });
      if (!user) {
        await Promise.all(
          data.securityQuestions.map((provided) =>
            this.userAuth.compareSecurityAnswer(
              String(provided.answer),
              FAKE_SECURITY_ANSWER_HASH
            )
          )
        );
        throw new UnauthorizedError(INVALID_RECOVERY_MESSAGE);
      }

      if (!user.security_questions || user.security_questions.length === 0) {
        throw new UnauthorizedError(INVALID_RECOVERY_MESSAGE);
      }

      const questions = data?.securityQuestions;
      let allAnswersAreValid =
        questions.length === user.security_questions.length;
      const providedQuestionKeys = new Set<string>();

      for (const provided of questions) {
        providedQuestionKeys.add(String(provided.question));
        const stored = user.security_questions.find(
          (q) => q.question === provided.question
        );
        const isValidAnswer = await this.userAuth.compareSecurityAnswer(
          String(provided.answer),
          stored ? String(stored.answer) : FAKE_SECURITY_ANSWER_HASH
        );
        allAnswersAreValid = allAnswersAreValid && !!stored && isValidAnswer;
      }

      if (
        providedQuestionKeys.size !== user.security_questions.length ||
        !allAnswersAreValid
      ) {
        throw new UnauthorizedError(INVALID_RECOVERY_MESSAGE);
      }

      const hashedPassword = await this.userAuth.hashPassword(
        data?.newPassword
      );

      const passwordUpdate = {
        id: user.id,
        password: hashedPassword,
      };
      const updatedUser = this.userRepository.updatePasswordAndInvalidateSessions
        ? await this.userRepository.updatePasswordAndInvalidateSessions(
            passwordUpdate
          )
        : await this.userRepository.updatePassword(passwordUpdate);

      if (!updatedUser) {
        throw new BusinessRuleError("Falha ao atualizar a senha do usuário");
      }

      return { message: "Senha redefinida com sucesso" };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (
        error instanceof BusinessRuleError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        throw error;
      }

      const errorMessage =
        error.message ||
        "Erro interno do servidor durante a redefinição de senha";
      throw new ServerError(`Falha na redefinição de senha: ${errorMessage}`);
    }
  }
}
