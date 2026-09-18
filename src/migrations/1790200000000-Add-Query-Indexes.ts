import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueryIndexes1790200000000 implements MigrationInterface {
  name = "AddQueryIndexes1790200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_categories_user" ON "categories" ("user_id")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_monthly_records_user_category_period" ON "monthly_records" ("user_id", "category_id", "year", "month")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transactions_user_monthly_date" ON "transactions" ("user_id", "monthly_record_id", "transaction_date")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_transactions_user_monthly_date"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_monthly_records_user_category_period"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_user"`);
  }
}
