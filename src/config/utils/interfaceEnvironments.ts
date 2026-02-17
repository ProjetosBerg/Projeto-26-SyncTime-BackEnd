export type Environment = 'test' | 'development' | 'production';

interface DbConfigPostgres {
  type: string;
  synchronize?: boolean;
  keepConnectionAlive?: boolean;
  logging?: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface DbConfigMongodb {
  type: string;
  url: string;
  database: string;
  extra?: {
    ssl?: boolean | { require: boolean; rejectUnauthorized: boolean };
    authSource?: string;
  };
}

export interface EnvConfigs {
  [key: string]: DbConfigPostgres | DbConfigMongodb;
  test: DbConfigPostgres | DbConfigMongodb;
  development: DbConfigPostgres | DbConfigMongodb;
  production: DbConfigPostgres | DbConfigMongodb;
}