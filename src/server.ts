import "module-alias/register";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import env from "env-var";
import router from "./routes";
import databaseHelper from "@/loaders/database";
import logger from "@/loaders/logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";
import cors from "cors";
import { initSocket, getIoInstance } from "./lib/socket";

const app = express();
const server = http.createServer(app);
dotenv.config();

const port = env.get("PORT").required().asPortNumber();
const NODE_ENV = env.get("NODE_ENV").default("development").asString();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Iniciar conexões com o banco de dados
databaseHelper.initConnections();

// Documentação da API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", router);

// Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Ajuste para domínios específicos em produção
    methods: ["GET", "POST"],
  },
});

initSocket(io);
getIoInstance(io);

server.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port} - Ambiente: ${NODE_ENV} 🚀`);
  logger.info("Socket.IO integrado e pronto para conexões!");
});
