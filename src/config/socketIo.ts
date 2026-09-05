import { Server, Socket } from "socket.io";
import logger from "@/loaders/logger";
import UserAuth from "@/auth/users/userAuth";
import { AuthenticationRepository } from "@/infra/db/postgres/authenticationRepository";

/**
 * Função para inicializar os eventos modulares do Socket.IO.
 * @param io - Instância do Server do Socket.IO
 */
export const initSocketEvents = (io: Server): void => {
  const userAuth = new UserAuth();
  const authenticationRepository = new AuthenticationRepository();

  io.use(async (socket, next) => {
    try {
      const rawToken = socket.handshake.auth?.token;
      const token =
        typeof rawToken === "string"
          ? rawToken.replace(/^Bearer\s+/i, "")
          : "";

      if (!token) {
        return next(new Error("Token não encontrado"));
      }

      const user = await userAuth.getUserByToken(token);
      if (!user?.id || !user.sessionId) {
        return next(new Error("Token inválido"));
      }

      const activeSession = await authenticationRepository.findActiveSession({
        userId: user.id,
        sessionId: user.sessionId,
      });

      if (!activeSession) {
        return next(new Error("Sessão inválida ou encerrada"));
      }

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error("Falha na autenticação"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user_${userId}`);

    logger.info(`Cliente ${socket.id} conectado na sala do usuário autenticado`);

    socket.emit("welcome", { message: "Bem-vindo ao sistema via Socket.IO!" });
    socket.emit("authSuccess", { message: "Autenticado com sucesso!" });

    // Evento de desconexão
    socket.on("disconnect", () => {
      logger.info(`Cliente autenticado desconectado: ${socket.id}`);
    });
  });
};
