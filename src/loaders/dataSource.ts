// TODO VERIFICAR QUANDO LANÇAR NA PRODUÇÃO PARA FAZER AS MIGRATIONS
import "reflect-metadata";
import { DataSource } from "typeorm";
import postgresDbConfig from "@/config/postgres";
import PostgresEntities from "@/domain/entities/postgres";

import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const postgresConfig = postgresDbConfig as PostgresConnectionOptions;

export const AppDataSource = new DataSource({
  ...postgresConfig,
  entities: [...Object.values(PostgresEntities)],
  migrations: ["src/migrations/**/*.ts"],
  synchronize: false,
  logging: true,
});
