import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteReminders1792368000000 implements MigrationInterface {
  name = "AddNoteReminders1792368000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "reminderMinutesBefore" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "reminderTimezoneOffset" integer`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notes_pending_reminder" ON "notes" ("reminderAt") WHERE "reminderAt" IS NOT NULL AND "reminderSentAt" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notes_pending_reminder"`);
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "reminderTimezoneOffset"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "reminderSentAt"`
    );
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN IF EXISTS "reminderAt"`);
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN IF EXISTS "reminderMinutesBefore"`
    );
  }
}
