import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDateOfNote21765034541330 implements MigrationInterface {
    name = 'AddColumnDateOfNote21765034541330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "dateOfNote"`);
        await queryRunner.query(`ALTER TABLE "notes" ADD "dateOfNote" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "dateOfNote"`);
        await queryRunner.query(`ALTER TABLE "notes" ADD "dateOfNote" date`);
    }

}
