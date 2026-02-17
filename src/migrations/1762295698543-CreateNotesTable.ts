import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotesTable1762295698543 implements MigrationInterface {
    name = 'CreateNotesTable1762295698543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(50) NOT NULL, "collaborators" text, "priority" character varying(50) NOT NULL, "activity" character varying(255) NOT NULL, "activityType" character varying(100) NOT NULL, "description" text NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "comments" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "category_id" uuid, "routine_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_3d5c6951d7233408f4f9359a5c1" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_123116c8516a53b97ca96e4db3c" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_7708dcb62ff332f0eaf9f0743a7"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_123116c8516a53b97ca96e4db3c"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_3d5c6951d7233408f4f9359a5c1"`);
        await queryRunner.query(`DROP TABLE "notes"`);
    }

}
