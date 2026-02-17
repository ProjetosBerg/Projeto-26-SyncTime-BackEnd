import { MigrationInterface, QueryRunner } from "typeorm";

export class ColumnUserImageUrl1763076380794 implements MigrationInterface {
    name = 'ColumnUserImageUrl1763076380794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "imageUrl" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "imageUrl"`);
    }

}
