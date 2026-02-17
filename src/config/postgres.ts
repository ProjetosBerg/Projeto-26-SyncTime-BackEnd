import * as env from "env-var";
import dotenv from "dotenv";
import { EnvConfigs } from "@/config/utils/interfaceEnvironments";

dotenv.config();

const environments: EnvConfigs = {
  test: {
    type: "postgres",
    synchronize: true,
    keepConnectionAlive: true,
    logging: true,
    host: env.get("TEST_DB_HOST").default("localhost").asString(),
    port: env.get("TEST_DB_PORT").default(5432).asIntPositive(),
    username: env.get("TEST_DB_USER").default("test").asString(),
    password: env.get("TEST_DB_PASS").default("test").asString(),
    database: env.get("TEST_DB_NAME").default("test").asString(),
  },
  development: {
    type: "postgres",
    host: env.get("DB_HOST").default("localhost").asString(),
    port: env.get("DB_PORT").default(5432).asIntPositive(),
    username: env.get("DB_USER").default("test").asString(),
    password: env.get("DB_PASS").default("test").asString(),
    database: env.get("DB_NAME").default("test").asString(),
  },
  production: {
    type: "postgres",
    host: env.get("DB_HOST").default("test").asString(),
    port: env.get("DB_PORT").default(5432).asIntPositive(),
    username: env.get("DB_USER").default("test").asString(),
    password: env.get("DB_PASS").default("test").asString(),
    database: env.get("DB_NAME").default("test-berg").asString(),
    synchronize: false,
    extra: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

const envKey = process.env.NODE_ENV || "development";

export default environments[envKey];
