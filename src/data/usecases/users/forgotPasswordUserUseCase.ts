import { UserModel } from "@/domain/models/postgres/UserModel";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ForgotPasswordUserUseCaseProtocol } from "../interfaces/users/forgotPasswordUseCaseProtocol";
import { forgotPasswordUserValidationSchema } from "../validation/users/forgotPasswordUserValidationSchema";

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
        throw new NotFoundError("Usuário não encontrado");
      }

      if (!user.security_questions || user.security_questions.length === 0) {
        throw new BusinessRuleError(
          "Nenhuma questão de segurança registrada para este usuário"
        );
      }

      const questions = data?.securityQuestions;
      if (questions.length !== user.security_questions.length) {
        throw new BusinessRuleError(
          "Número de questões de segurança fornecidas não corresponde ao registrado"
        );
      }

      for (const provided of questions) {
        const stored = user.security_questions.find(
          (q) => q.question === provided.question
        );
        if (!stored) {
          throw new BusinessRuleError("Questão de segurança não encontrada");
        }
        const isValidAnswer = await this.userAuth.compareSecurityAnswer(
          String(provided.answer),
          String(stored.answer)
        );
        if (!isValidAnswer) {
          throw new BusinessRuleError("Resposta de segurança inválida");
        }
      }

      const hashedPassword = await this.userAuth.hashPassword(
        data?.newPassword
      );

      const updatedUser = await this.userRepository.updatePassword({
        id: user.id,
        password: hashedPassword,
      });

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
        error instanceof NotFoundError
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
