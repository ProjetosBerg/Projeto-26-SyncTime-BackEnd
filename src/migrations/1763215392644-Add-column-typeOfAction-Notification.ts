import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnTypeOfActionNotification1763215392644 implements MigrationInterface {
    name = 'AddColumnTypeOfActionNotification1763215392644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "typeOfAction" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "typeOfAction"`);
    }

}
