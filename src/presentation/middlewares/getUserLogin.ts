import e, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "../protocols/middleware";

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
  async handle(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { authorization } = req.headers;
    if (!authorization)
      return res.status(401).json({ message: "Token não encontrado" });
    const [, token] = authorization.split(" ");
    if (!token)
      return res.status(401).json({ message: "Token não encontrado" });

    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded)
      return res.status(401).json({ message: "Token não encontrado" });
    req.headers.login = decoded.login;
    req.headers.nameUser = decoded.name;

    try {
      const verified = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as JwtPayload;

      if (!verified) {
        return res.status(401).json({ message: "Token não encontrado" });
      }
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
      return res.status(400).json({ message: "Token inválido" });
    }
  }
}
