import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnIsNewNotification1763416071005 implements MigrationInterface {
    name = 'AddColumnIsNewNotification1763416071005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "isNew" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "isNew" SET DEFAULT false`);
    }

}
