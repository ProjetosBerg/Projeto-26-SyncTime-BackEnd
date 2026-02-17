import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnAuthentication1762868082954 implements MigrationInterface {
    name = 'AddColumnAuthentication1762868082954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication" ADD "entryCount" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "authentication" ADD "lastEntryAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication" DROP COLUMN "lastEntryAt"`);
        await queryRunner.query(`ALTER TABLE "authentication" DROP COLUMN "entryCount"`);
    }

}
