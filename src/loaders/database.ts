import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import mongoose, { Connection as MongooseConnection } from "mongoose";
import postgresDbConfig from "@/config/postgres";
import mongoDbConfig from "@/config/mongodb";
import logger from "@/loaders/logger";
import PostgresEntities from "@/domain/entities/postgres";

class DatabaseHelper {
  private typeOrmConnections: Connection[];
  private mongooseConnection: MongooseConnection | null;

  private postgresDbConfig: any;
  private mongoDbConfig: any;

  constructor() {
    this.typeOrmConnections = [];
    this.mongooseConnection = null;
    this.postgresDbConfig = postgresDbConfig;
    this.mongoDbConfig = mongoDbConfig;
  }

  async startPostgresConnection() {
    try {
      const postgresConnection = await createConnection({
        ...this.postgresDbConfig,
        entities: [...Object.values(PostgresEntities || {})],
        migrations: ["src/migrations/**/*.ts"],
        logging: false,
        maxQueryExecutionTime: 1000,
        name: "default",
      });
      this.typeOrmConnections.push(postgresConnection);
      logger.info("Postgres connected");
      return postgresConnection;
    } catch (error) {
      logger.error(`Database Postgres error: ${error}`);
      process.exit(1);
    }
  }

  async startMongodbConnection() {
    try {
      const uri = this.mongoDbConfig.url;
      await mongoose.connect(uri, {
        maxPoolSize: 1000,
        connectTimeoutMS: 10000,
      });
      this.mongooseConnection = mongoose.connection;
      logger.info("Mongodb connected");
      return this.mongooseConnection;
    } catch (error) {
      logger.error(`Database MongoDB error: ${error}`);
      process.exit(1);
    }
  }

  async initConnections() {
    await Promise.all([
      this.startPostgresConnection(),
      this.startMongodbConnection(),
    ]);
  }

  async closeConnections() {
    const typeOrmPromises = this.typeOrmConnections.map((conn) => conn.close());
    const mongoosePromise = this.mongooseConnection
      ? this.mongooseConnection.close()
      : Promise.resolve();
    await Promise.all([...typeOrmPromises, mongoosePromise]);
  }

  setPostgresPort(port: number) {
    this.postgresDbConfig.port = port;
    return this;
  }

  setMongoPort(port: number) {
    this.mongoDbConfig.port = port;
    return this;
  }

  getMongooseConnection() {
    return this.mongooseConnection;
  }
}

export default new DatabaseHelper();
