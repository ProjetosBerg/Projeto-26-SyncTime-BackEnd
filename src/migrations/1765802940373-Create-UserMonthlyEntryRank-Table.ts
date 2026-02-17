import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserMonthlyEntryRankTable1765802940373 implements MigrationInterface {
    name = 'CreateUserMonthlyEntryRankTable1765802940373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_monthly_entry_rank" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "year" integer NOT NULL, "month" integer NOT NULL, "totalEntries" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e70c8c9231d431115bfb8ee228a" UNIQUE ("userId", "year", "month"), CONSTRAINT "PK_d2e8abbfe045b9e220869948a3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" ADD CONSTRAINT "FK_2d576fc1b2d48e412840ec669af" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" DROP CONSTRAINT "FK_2d576fc1b2d48e412840ec669af"`);
        await queryRunner.query(`DROP TABLE "user_monthly_entry_rank"`);
    }

}
