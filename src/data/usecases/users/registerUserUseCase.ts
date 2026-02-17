import { UserModel } from "@/domain/models/postgres/UserModel";
import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { RegisterUserUseCaseProtocol } from "../interfaces/users/registerUserUseCaseProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import UserAuth from "@/auth/users/userAuth";
import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { registerUserValidationSchema } from "../validation/users/registerUserValidationSchema";

export class RegisterUserUseCase implements RegisterUserUseCaseProtocol {
  constructor(
    private readonly userRepository: UserRepositoryProtocol,
    private readonly userAuth: UserAuth
  ) {}

  /**
   * Realiza o cadastro de um usuário com os dados fornecidos, incluindo questões de segurança
   * @param {RegisterUserUseCaseProtocol.Params} data - Os dados de registro do usuário
   * @param {string} data.name - O nome do usuário
   * @param {string} data.login - O login do usuário
   * @param {string} data.email - O endereço de email do usuário
   * @param {string} data.password - A senha da conta do usuário
   * @param {string} data.confirmpassword - A confirmação da senha do usuário
   * @param {string} user.imageUrl - URL da imagem do usuário
   * @param {string} user.publicId - ID publico da imagem do usuário
   * @param {Array<{ question: string; answer: string }>} data.securityQuestions - Lista de questões de segurança
   * @returns {Promise<RegisterUserUseCaseProtocol.Result | undefined>} O usuário registrado e o token de autenticação
   * @throws {BusinessRuleError} Se as credenciais forem inválidas ou as questões de segurança forem insuficientes
   * @throws {ServerError} Se ocorrer um erro ao registrar o usuário
   */
  async handle(
    data: RegisterUserUseCaseProtocol.Params
  ): Promise<RegisterUserUseCaseProtocol.Result | undefined> {
    try {
      await registerUserValidationSchema.validate(data, { abortEarly: false });

      const existingEmailUser = await this.userRepository.findOne({
        email: data.email,
      });

      if (existingEmailUser) {
        throw new BusinessRuleError(
          "Já existe um usuário cadastrado com este endereço de email"
        );
      }

      const existingLogin = await this.userRepository.findOne({
        login: data.login,
      });

      if (existingLogin) {
        throw new BusinessRuleError(
          "Já existe um usuário cadastrado com este login"
        );
      }

      const hashedPassword = await this.userAuth.hashPassword(data?.password);

      const hashedSecurityQuestions = await Promise.all(
        data.securityQuestions.map(async (question) => ({
          question: question.question,
          answer: await this.userAuth.hashSecurityAnswer(
            String(question.answer)
          ),
        }))
      );

      const newUser: UserModel | undefined = await this.userRepository.create({
        name: data?.name,
        login: data?.login,
        email: data?.email,
        password: hashedPassword,
        securityQuestions: hashedSecurityQuestions,
        imageUrl: data?.imageUrl,
        publicId: data?.publicId,
      });

      if (!newUser || !newUser.id) {
        throw new BusinessRuleError("Falha ao criar usuário no banco de dados");
      }

      const { token } = await this.userAuth.createUserToken({
        id: newUser?.id,
        login: newUser?.login,
        name: newUser?.name,
        email: newUser?.email,
      });

      if (!token) {
        throw new BusinessRuleError(
          "Falha ao gerar token de autenticação para o usuário"
        );
      }

      return {
        user: newUser,
        token,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(`Falha no cadastro do usuário: ${errorMessage}`);
    }
  }
}
