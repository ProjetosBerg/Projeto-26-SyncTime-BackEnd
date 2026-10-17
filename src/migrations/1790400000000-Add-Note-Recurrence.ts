import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteRecurrence1790400000000 implements MigrationInterface {
  name = "AddNoteRecurrence1790400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "recurrenceGroupId" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "recurrenceFrequency" character varying(20)`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "recurrenceInterval" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "recurrenceEndDate" date`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "recurrenceWeekDays" json`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_notes_recurrence_group_date" ON "notes" ("recurrenceGroupId", "dateOfNote") WHERE "recurrenceGroupId" IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_notes_recurrence_group_date"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "recurrenceWeekDays"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "recurrenceEndDate"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "recurrenceInterval"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "recurrenceFrequency"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "recurrenceGroupId"`
    );
  }
}
