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
const jwtSecret = env.get("JWT_SECRET").required().asString().trim();
// if (NODE_ENV === "production" && jwtSecret.length < 32) {
//   throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres em produção");
// }
const refreshTokenTtlDays = env
  .get("REFRESH_TOKEN_TTL_DAYS")
  .default("7")
  .asIntPositive();
if (refreshTokenTtlDays > 30) {
  throw new Error("REFRESH_TOKEN_TTL_DAYS deve estar entre 1 e 30");
}
const configuredOrigins = env
  .get("CORS_ALLOWED_ORIGINS")
  .default("http://localhost:5173,http://127.0.0.1:5173")
  .asString()
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (NODE_ENV === "production" && !process.env.CORS_ALLOWED_ORIGINS?.trim()) {
  throw new Error("CORS_ALLOWED_ORIGINS deve ser configurado em produção");
}

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem não permitida pelo CORS"));
  },
  credentials: true,
};

app.disable("x-powered-by");
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  if (NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cors(corsOptions));

// Documentação da API
if (NODE_ENV !== "production" || process.env.SWAGGER_ENABLED === "true") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use("/api", router);

const io = new Server(server, {
  cors: {
    origin: configuredOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const bootstrap = async (): Promise<void> => {
  await databaseHelper.initConnections();

  initSocket(io);
  getIoInstance(io);

  server.listen(port, () => {
    logger.info(`Servidor rodando na porta ${port} - Ambiente: ${NODE_ENV} 🚀`);
    logger.info("Socket.IO integrado e pronto para conexões!");
  });
};

void bootstrap().catch((error) => {
  logger.error(`Falha ao inicializar o servidor: ${String(error)}`);
  process.exit(1);
});
