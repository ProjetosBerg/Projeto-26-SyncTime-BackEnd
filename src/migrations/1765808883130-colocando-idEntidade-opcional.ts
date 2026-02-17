import { MigrationInterface, QueryRunner } from "typeorm";

export class ColocandoIdEntidadeOpcional1765808883130 implements MigrationInterface {
    name = 'ColocandoIdEntidadeOpcional1765808883130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "idEntity" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "idEntity" SET NOT NULL`);
    }

}
