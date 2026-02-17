import { UserModel } from "@/domain/models/postgres/UserModel";
import { User } from "@/domain/entities/postgres/User";
import { SecurityQuestion } from "@/domain/entities/postgres/SecurityQuestion";
import { getRepository } from "typeorm";
import { UserRepositoryProtocol } from "../interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class UserRepository implements UserRepositoryProtocol {
  constructor() {}

  /**
   * Cria um novo usuário no banco de dados com questões de segurança
   * @param {UserRepositoryProtocol.CreateParams} user - Os dados do usuário a serem criados
   * @param {string} user.name - Nome do usuário
   * @param {string} user.login - Login do usuário
   * @param {string} user.email - Endereço de e-mail do usuário
   * @param {string} user.password - Senha criptografada do usuário
   * @param {string} user.imageUrl - URL da imagem do usuário
   * @param {string} user.publicId - ID publico da imagem do usuário
   * @param {Array<{ question: string; answer: string }>} user.securityQuestions - Lista de questões de segurança
   * @returns {Promise<UserModel | undefined>} O usuário criado
   */
  async create(
    user: UserRepositoryProtocol.CreateParams
  ): Promise<UserModel | undefined> {
    try {
      const repository = getRepository(User);
      const securityQuestionRepository = getRepository(SecurityQuestion);

      const newUser = repository.create({
        name: user.name,
        login: user.login,
        email: user.email,
        password: user.password,
        security_questions: user?.securityQuestions.map((sq) =>
          securityQuestionRepository.create({
            question: sq.question as string,
            answer: sq.answer as string,
          })
        ),
        imageUrl: user?.imageUrl || undefined,
        publicId: user?.publicId || undefined,
      });

      const savedUser = await repository.save(newUser);
      return savedUser;
    } catch (error: any) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  /**
   * Atualiza a senha de um usuário no banco de dados
   * @param {UserRepositoryProtocol.UpdateParams} data - Os dados para atualização
   * @param {string} data.id - ID do usuário
   * @param {string} data.password - Nova senha criptografada
   * @returns {Promise<UserModel | undefined>} O usuário atualizado
   */
  async updatePassword(
    data: UserRepositoryProtocol.UpdatePasswordParams
  ): Promise<UserModel | undefined> {
    try {
      const repository = getRepository(User);
      const user = await repository.findOne({ where: { id: data.id } });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }
      user.password = data.password;

      user.updated_at = new Date();
      const updatedUser = await repository.save(user);
      return updatedUser;
    } catch (error: any) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Busca um usuário por ID ou e-mail
   * @param {UserRepositoryProtocol.FindOneParams} data - Os critérios de busca
   * @param {string} [data.id] - ID do usuário (opcional)
   * @param {string} [data.login] - Login do usuário (opcional)
   * @param {string} [data.email] - E-mail do usuário (opcional)
   * @returns {Promise<UserModel | null>} O usuário encontrado ou null
   */
  async findOne(
    data: UserRepositoryProtocol.FindOneParams
  ): Promise<UserModel | null> {
    try {
      const repository = getRepository(User);
      const user = await repository.findOne({
        where: data,
        relations: ["security_questions"],
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fazer o update do usuário
   * @param {UserRepositoryProtocol.UpdateUserParams} data - Os critérios de atualização
   * @param {string} [data.id] - ID do usuário
   * @param {string} [data.login] - Login do usuário (opcional)
   * @param {string} [data.email] - E-mail do usuário (opcional)
   * @param {Array<{ question: string; answer: string }>} [data.securityQuestions] - Lista de questões de segurança (opcional)
   * @returns {Promise<UserModel | null>} O usuário encontrado ou null
   */

  async updateUser(
    data: UserRepositoryProtocol.UpdateUserParams
  ): Promise<UserModel | undefined> {
    try {
      const repository = getRepository(User);
      const securityQuestionRepository = getRepository(SecurityQuestion);
      const user = await repository.findOne({
        where: { id: data.id },
        relations: ["security_questions"],
      });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      if (data.name) user.name = data.name;
      if (data.email) user.email = data.email;
      if (data.securityQuestions) {
        user.security_questions = data.securityQuestions.map((sq) =>
          securityQuestionRepository.create({
            question: String(sq.question),
            answer: String(sq.answer),
          })
        );
      }
      if (data.bio !== undefined) user.bio = data.bio;
      if (data.imageUrl !== undefined) user.imageUrl = data.imageUrl;
      if (data.publicId !== undefined) user.publicId = data.publicId;
      user.updated_at = new Date();

      const updatedUser = await repository.save(user);
      return updatedUser;
    } catch (error: any) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Deleta um usuário do banco de dados pelo ID
   * @param {UserRepositoryProtocol.DeleteUserParams} data - Os dados para deleção
   * @returns {Promise<void>}
   */
  async deleteUser(
    data: UserRepositoryProtocol.DeleteUserParams
  ): Promise<void> {
    try {
      const repository = getRepository(User);
      const user = await repository.findOne({ where: { id: data.id } });
      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }
      await repository.remove(user);
    } catch (error: any) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }
}
