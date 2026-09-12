import { MigrationInterface, QueryRunner } from "typeorm";

type ForeignKeyDefinition = {
  table: string;
  name: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
};

const foreignKeys: ForeignKeyDefinition[] = [
  {
    table: "record_types",
    name: "FK_9677255dafdc5944598b548957c",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "transactions",
    name: "FK_8adbce04b1b2ae8bdd4a52af314",
    column: "monthly_record_id",
    referencedTable: "monthly_records",
    referencedColumn: "id",
  },
  {
    table: "transactions",
    name: "FK_c9e41213ca42d50132ed7ab2b0f",
    column: "category_id",
    referencedTable: "categories",
    referencedColumn: "id",
  },
  {
    table: "transactions",
    name: "FK_e9acc6efa76de013e8c1553ed2b",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "monthly_records",
    name: "FK_08e7730797d89228654e795245a",
    column: "category_id",
    referencedTable: "categories",
    referencedColumn: "id",
  },
  {
    table: "monthly_records",
    name: "FK_fa90487f1fdfd325065a8e4fd22",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "categories",
    name: "FK_03850e05f77755e5bb4a650df60",
    column: "record_type_id",
    referencedTable: "record_types",
    referencedColumn: "id",
  },
  {
    table: "categories",
    name: "FK_2296b7fe012d95646fa41921c8b",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "routines",
    name: "FK_4e88ad22cd8043b159518d10123",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "notes",
    name: "FK_3d5c6951d7233408f4f9359a5c1",
    column: "category_id",
    referencedTable: "categories",
    referencedColumn: "id",
  },
  {
    table: "notes",
    name: "FK_123116c8516a53b97ca96e4db3c",
    column: "routine_id",
    referencedTable: "routines",
    referencedColumn: "id",
  },
  {
    table: "notes",
    name: "FK_7708dcb62ff332f0eaf9f0743a7",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
  {
    table: "notifications",
    name: "FK_9a8a82462cab47c73d25f49261f",
    column: "user_id",
    referencedTable: "users",
    referencedColumn: "id",
  },
];

export class AddDeletionCascades1789160000000 implements MigrationInterface {
  name = "AddDeletionCascades1789160000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const key of foreignKeys) {
      await queryRunner.query(
        `ALTER TABLE "${key.table}" DROP CONSTRAINT "${key.name}"`
      );
      await queryRunner.query(
        `ALTER TABLE "${key.table}" ADD CONSTRAINT "${key.name}" FOREIGN KEY ("${key.column}") REFERENCES "${key.referencedTable}"("${key.referencedColumn}") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const key of [...foreignKeys].reverse()) {
      await queryRunner.query(
        `ALTER TABLE "${key.table}" DROP CONSTRAINT "${key.name}"`
      );
      await queryRunner.query(
        `ALTER TABLE "${key.table}" ADD CONSTRAINT "${key.name}" FOREIGN KEY ("${key.column}") REFERENCES "${key.referencedTable}"("${key.referencedColumn}") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
    }
  }
}
