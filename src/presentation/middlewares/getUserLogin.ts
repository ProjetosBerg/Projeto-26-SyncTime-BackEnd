import { NextFunction, Request, Response } from "express";
import { Middleware } from "../protocols/middleware";
import UserAuth from "@/auth/users/userAuth";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";

export type JwtPayload = {
  id: string;
  login: string;
  name: string;
  email: string;
  profile: string;
  sessionId: string;
  iat: number;
  exp: number;
};
export class GetUserLogin implements Middleware {
  constructor(
    private readonly userAuth: UserAuth,
    private readonly authenticationRepository: AuthenticationRepositoryProtocol
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { authorization } = req.headers;
    const token = this.userAuth.getToken({ authorization });

    if (!token) {
      return res.status(401).json({ message: "Token não encontrado" });
    }

    try {
      const verified = (await this.userAuth.getUserByToken(
        token
      )) as JwtPayload | null;

      if (!verified?.id || !verified.sessionId) {
        return res.status(401).json({ message: "Token inválido" });
      }

      const activeSession =
        await this.authenticationRepository.findActiveSession({
          userId: verified.id,
          sessionId: verified.sessionId,
        });

      if (!activeSession) {
        return res.status(401).json({ message: "Sessão inválida ou encerrada" });
      }

      req.headers.login = verified.login;
      req.headers.nameUser = verified.name;

      const user = {
        id: verified.id,
        login: verified.login,
        name: verified.name,
        email: verified.email,
        sessionId: verified.sessionId,
      };

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  }
}
