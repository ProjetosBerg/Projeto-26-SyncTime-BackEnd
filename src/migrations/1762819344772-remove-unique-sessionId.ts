import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueSessionId1762819344772 implements MigrationInterface {
    name = 'RemoveUniqueSessionId1762819344772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication" DROP CONSTRAINT "UQ_1a27572938175716baaa47b430b"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication" ADD CONSTRAINT "UQ_1a27572938175716baaa47b430b" UNIQUE ("sessionId")`);
    }

}
