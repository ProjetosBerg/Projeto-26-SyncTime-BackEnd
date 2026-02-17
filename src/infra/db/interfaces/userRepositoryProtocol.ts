import { UserModel } from "@/domain/models/postgres/UserModel";
import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";

export interface UserRepositoryProtocol {
  create(
    data: UserRepositoryProtocol.CreateParams
  ): Promise<UserModel | undefined>;
  findOne(
    data: UserRepositoryProtocol.FindOneParams
  ): Promise<UserModel | null>;
  updatePassword(
    data: UserRepositoryProtocol.UpdatePasswordParams
  ): Promise<UserModel | undefined>;
  updateUser(
    data: UserRepositoryProtocol.UpdateUserParams
  ): Promise<UserModel | undefined>;
  deleteUser(data: UserRepositoryProtocol.DeleteUserParams): Promise<void>;
}

export namespace UserRepositoryProtocol {
  export type CreateParams = {
    email: UserModel["email"];
    name: UserModel["name"];
    login: UserModel["login"];
    password: UserModel["password"];
    securityQuestions: Array<{
      question: SecurityQuestionModel["question"];
      answer: SecurityQuestionModel["answer"];
    }>;
    imageUrl?: UserModel["imageUrl"];
    publicId?: UserModel["publicId"];
  };

  export type FindOneParams = {
    id?: UserModel["id"];
    login?: UserModel["login"];
    email?: UserModel["email"];
  };

  export type UpdatePasswordParams = {
    id: UserModel["id"];
    password: UserModel["password"];
  };

  export type UpdateUserParams = {
    id: UserModel["id"];
    name?: UserModel["name"];
    email?: UserModel["email"];
    bio?: UserModel["bio"];
    securityQuestions?: Array<{
      question: SecurityQuestionModel["question"];
      answer: SecurityQuestionModel["answer"];
    }>;
    imageUrl?: UserModel["imageUrl"];
    publicId?: UserModel["publicId"];
  };

  export type DeleteUserParams = {
    id: UserModel["id"];
  };
}
