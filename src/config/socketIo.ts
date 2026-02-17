import { Server, Socket } from "socket.io";
import logger from "@/loaders/logger";

/**
 * Função para inicializar os eventos modulares do Socket.IO.
 * @param io - Instância do Server do Socket.IO
 */
export const initSocketEvents = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    logger.info(`Novo cliente conectado: ${socket.id}`);

    socket.emit("welcome", { message: "Bem-vindo ao sistema via Socket.IO!" });

    socket.on("auth", (data: { userId: string }) => {
      if (!data.userId) {
        logger.warn("Tentativa de auth sem userId");
        socket.emit("authError", { message: "userId obrigatório" });
        return;
      }

      socket.join(`user_${data.userId}`);
      socket.data.userId = data.userId;
      logger.info(
        `Cliente ${socket.id} autenticado como userId: ${data.userId} e entrou na sala`
      );

      socket.emit("authSuccess", { message: "Autenticado com sucesso!" });
    });

    // Evento de desconexão
    socket.on("disconnect", () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) {
        logger.info(`Cliente desconectado: ${socket.id} (userId: ${userId})`);
      } else {
        logger.info(`Cliente desconectado sem auth: ${socket.id}`);
      }
    });
  });
};
