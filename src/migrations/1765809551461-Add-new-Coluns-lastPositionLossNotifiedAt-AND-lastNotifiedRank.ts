import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColunsLastPositionLossNotifiedAtANDLastNotifiedRank1765809551461 implements MigrationInterface {
    name = 'AddNewColunsLastPositionLossNotifiedAtANDLastNotifiedRank1765809551461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" ADD "lastPositionLossNotifiedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" ADD "lastNotifiedRank" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" DROP COLUMN "lastNotifiedRank"`);
        await queryRunner.query(`ALTER TABLE "user_monthly_entry_rank" DROP COLUMN "lastPositionLossNotifiedAt"`);
    }

}
