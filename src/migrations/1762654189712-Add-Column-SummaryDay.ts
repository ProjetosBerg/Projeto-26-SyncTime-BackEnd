import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnSummaryDay1762654189712 implements MigrationInterface {
    name = 'AddColumnSummaryDay1762654189712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ADD "summaryDay" text`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "priority" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "activity" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "activityType" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "startTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "endTime" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "endTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "startTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "activityType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "activity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "priority" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "summaryDay"`);
    }

}
