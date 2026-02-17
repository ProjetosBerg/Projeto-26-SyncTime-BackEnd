import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIsNewNotification1763415740765 implements MigrationInterface {
    name = 'AddColumnIsNewNotification1763415740765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "isNew" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "isNew"`);
    }

}
