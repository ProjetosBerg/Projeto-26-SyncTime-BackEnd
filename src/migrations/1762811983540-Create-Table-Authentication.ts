import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableAuthentication1762811983540 implements MigrationInterface {
    name = 'CreateTableAuthentication1762811983540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "authentication" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "userId" uuid NOT NULL, "loginAt" TIMESTAMP NOT NULL, "logoutAt" TIMESTAMP, "isOffensive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a27572938175716baaa47b430b" UNIQUE ("sessionId"), CONSTRAINT "PK_684fcb9924c8502d64b129cc8b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "authentication" ADD CONSTRAINT "FK_2ce04c38ee386596885c903d9ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication" DROP CONSTRAINT "FK_2ce04c38ee386596885c903d9ad"`);
        await queryRunner.query(`DROP TABLE "authentication"`);
    }

}
