import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoutinesTable1762173448049 implements MigrationInterface {
    name = 'CreateRoutinesTable1762173448049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "routines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(100) NOT NULL, "period" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_6847e8f0f74e65a6f10409dee9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "routines" ADD CONSTRAINT "FK_4e88ad22cd8043b159518d10123" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routines" DROP CONSTRAINT "FK_4e88ad22cd8043b159518d10123"`);
        await queryRunner.query(`DROP TABLE "routines"`);
    }

}
