import { MigrationInterface, QueryRunner } from "typeorm";

export class ColumnUserPublicId1763077723465 implements MigrationInterface {
    name = 'ColumnUserPublicId1763077723465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "publicId" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "publicId"`);
    }

}
