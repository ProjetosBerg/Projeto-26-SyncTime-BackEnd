import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenAuthentication1766000000000
  implements MigrationInterface
{
  name = "AddRefreshTokenAuthentication1766000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "authentication" ADD "refreshTokenHash" character varying(64)`
    );
    await queryRunner.query(
      `ALTER TABLE "authentication" ADD "refreshTokenExpiresAt" TIMESTAMP`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_authentication_refresh_token_hash" ON "authentication" ("refreshTokenHash") WHERE "refreshTokenHash" IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_authentication_refresh_token_hash"`
    );
    await queryRunner.query(
      `ALTER TABLE "authentication" DROP COLUMN "refreshTokenExpiresAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "authentication" DROP COLUMN "refreshTokenHash"`
    );
  }
}
