import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsPathAndPayloadNotification1763213685843 implements MigrationInterface {
    name = 'AddColumnsPathAndPayloadNotification1763213685843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "path" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "payload" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "payload"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "path"`);
    }

}
