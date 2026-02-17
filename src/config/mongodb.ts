import * as env from "env-var";
import { EnvConfigs } from "@/config/utils/interfaceEnvironments";

const environments: EnvConfigs = {
  development: {
    type: "mongodb",
    url: env.get("MONGODB_URL").default("test").asString(),
    database: env.get("MONGODB_NAME").default("test").asString(),
    extra: {
      ssl: false,
      authSource: "test",
    },
  },
  test: {
    type: "mongodb",
    url: env.get("MONGODB_URL").default("test").asString(),
    database: env.get("MONGODB_NAME").default("test").asString(),
    extra: {
      ssl: false,
      authSource: "test",
    },
  },
  production: {
    type: "mongodb",
    url: env.get("MONGODB_URL").default("test").asString(),
    database: env.get("MONGODB_NAME").default("test").asString(),
    extra: {
      ssl: true,
      authSource: "admin",
    },
  },
};

export default environments[process.env.NODE_ENV || "production"];
