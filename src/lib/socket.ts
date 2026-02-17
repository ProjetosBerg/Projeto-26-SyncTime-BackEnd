import { Server } from "socket.io";
import logger from "@/loaders/logger";
import { initSocketEvents } from "@/config/socketIo";

let ioInstance: Server | null = null;

/**
 * Registra a instância do io para uso global no app.
 * @param io - Instância do Server do Socket.IO
 */
export const getIoInstance = (io: Server): void => {
  if (!ioInstance) {
    ioInstance = io;
    logger.info("Instância do Socket.IO registrada globalmente.");
  }
};

/**
 * Retorna a instância do io (para emitir eventos de outros módulos, ex: use cases).
 * @returns Server | null
 */
export const getIo = (): Server | null => {
  return ioInstance;
};

/**
 * Inicializa os eventos do Socket.IO (wrapper para chamar o init de sockets/socket.ts).
 * @param io - Instância do Server
 */
export const initSocket = (io: Server): void => {
  logger.info("Inicializando eventos do Socket.IO...");
  initSocketEvents(io);
};
