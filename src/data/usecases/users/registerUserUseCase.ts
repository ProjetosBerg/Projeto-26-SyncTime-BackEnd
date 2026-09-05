import { UserModel } from "@/domain/models/postgres/UserModel";
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

      const hashedPassword = await this.userAuth.hashPassword(data.password);
      const hashedSecurityQuestions = await Promise.all(
        data.securityQuestions.map(async (securityQuestion) => ({
          question: securityQuestion.question,
          answer: await this.userAuth.hashSecurityAnswer(
            String(securityQuestion.answer)
          ),
        }))
      );

      const newUser: UserModel | undefined = await this.userRepository.create({
        name: data.name,
        login: data.login,
        email: data.email,
        password: hashedPassword,
        securityQuestions: hashedSecurityQuestions,
        imageUrl: data.imageUrl,
        publicId: data.publicId,
      });

      if (!newUser || !newUser.id) {
        throw new BusinessRuleError("Falha ao criar usuário no banco de dados");
      }

      return { user: newUser };
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
