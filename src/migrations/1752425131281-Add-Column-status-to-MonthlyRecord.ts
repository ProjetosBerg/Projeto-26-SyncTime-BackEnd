import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnStatusToMonthlyRecord1752425131281 implements MigrationInterface {
    name = 'AddColumnStatusToMonthlyRecord1752425131281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monthly_records" ADD "status" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monthly_records" DROP COLUMN "status"`);
    }

}
