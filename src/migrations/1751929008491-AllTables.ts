import { MigrationInterface, QueryRunner } from "typeorm";

export class AllTables1751929008491 implements MigrationInterface {
    name = 'AllTables1751929008491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "security_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying(255) NOT NULL, "answer" character varying(255) NOT NULL, "userId" uuid, CONSTRAINT "PK_40863dac02e72e1ea928b07d5ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "record_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "icone" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_880422ee99e61c29fc7c369849d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" character varying(255), "amount" numeric(10,2), "transaction_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "monthly_record_id" uuid NOT NULL, "category_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "monthly_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" character varying(255), "goal" character varying(255) NOT NULL, "initial_balance" numeric(10,2), "month" integer NOT NULL, "year" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "category_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_dd50aef519934a7f265f91f8eee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(255), "type" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "record_type_id" integer NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "login" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "security_questions" ADD CONSTRAINT "FK_fc31b5460e57c3607cc78021f5e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "record_types" ADD CONSTRAINT "FK_9677255dafdc5944598b548957c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8adbce04b1b2ae8bdd4a52af314" FOREIGN KEY ("monthly_record_id") REFERENCES "monthly_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "monthly_records" ADD CONSTRAINT "FK_08e7730797d89228654e795245a" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "monthly_records" ADD CONSTRAINT "FK_fa90487f1fdfd325065a8e4fd22" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_03850e05f77755e5bb4a650df60" FOREIGN KEY ("record_type_id") REFERENCES "record_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_03850e05f77755e5bb4a650df60"`);
        await queryRunner.query(`ALTER TABLE "monthly_records" DROP CONSTRAINT "FK_fa90487f1fdfd325065a8e4fd22"`);
        await queryRunner.query(`ALTER TABLE "monthly_records" DROP CONSTRAINT "FK_08e7730797d89228654e795245a"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8adbce04b1b2ae8bdd4a52af314"`);
        await queryRunner.query(`ALTER TABLE "record_types" DROP CONSTRAINT "FK_9677255dafdc5944598b548957c"`);
        await queryRunner.query(`ALTER TABLE "security_questions" DROP CONSTRAINT "FK_fc31b5460e57c3607cc78021f5e"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "monthly_records"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "record_types"`);
        await queryRunner.query(`DROP TABLE "security_questions"`);
    }

}
