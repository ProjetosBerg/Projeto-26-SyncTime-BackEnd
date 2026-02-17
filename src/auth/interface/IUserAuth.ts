export interface IUser {
  id: string;
  name: string;
  login: string;
  email: string;
  sessionId?: string;
}

export interface ITokenPayload {
  id: string;
  name: string;
  login: string;
  email: string;
  iat?: number;
  exp?: number;
  sessionId?: string;
}

export interface IUserAuth {
  createUserToken(
    user: IUser
  ): Promise<{ message: string; token: string | null; user: IUser }>;

  getToken(headers: { authorization?: string }): string | null;

  getUserByToken(token: string): Promise<ITokenPayload | null>;

  checkToken(token: string): Promise<boolean>;

  hashPassword(password: string): Promise<string>;

  hashSecurityAnswer(answer: string): Promise<string>;

  comparePassword(password: string, hashedPassword: string): Promise<boolean>;

  compareSecurityAnswer(answer: string, hashedAnswer: string): Promise<boolean>;
}
