import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMyDayQueryIndex1790300000000 implements MigrationInterface {
  name = "AddMyDayQueryIndex1790300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notes_user_date_time" ON "notes" ("user_id", "dateOfNote", "startTime")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notes_user_date_time"`);
  }
}
