import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGoals1792800000000 implements MigrationInterface {
  name = "CreateGoals1792800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "targetCount" integer NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_goals_target_positive" CHECK ("targetCount" > 0), CONSTRAINT "CHK_goals_date_range" CHECK ("endDate" >= "startDate"), CONSTRAINT "PK_goals" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_goals_user_end_date" ON "goals" ("user_id", "endDate")`
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ADD CONSTRAINT "FK_goals_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT IF EXISTS "FK_goals_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_goals_user_end_date"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "goals"`);
  }
}
