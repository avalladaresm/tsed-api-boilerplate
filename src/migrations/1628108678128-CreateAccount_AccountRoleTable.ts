import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAccountAccountRoleTable1628108678128 implements MigrationInterface {
  name = "CreateAccountAccountRoleTable1628108678128";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "generic_api_db".."AccountRole" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ac470620350ff9066873ae211eb" DEFAULT NEWSEQUENTIALID(), "name" varchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_e88687f1e81f34a2935e2a3be3c" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_eaa6cbd29adb17abea862f11b9d" DEFAULT getdate(), CONSTRAINT "UQ_a9a9bce7e1b3f3c40761c3bb35b" UNIQUE ("name"), CONSTRAINT "PK_ac470620350ff9066873ae211eb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "generic_api_db".."Account" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_bf68fd30f1adeede9c72a5cac09" DEFAULT NEWSEQUENTIALID(), "name" varchar(255) NOT NULL, "phoneNumber" varchar(25) NOT NULL, "dob" date NOT NULL, "country" varchar(255) NOT NULL, "state" varchar(255), "city" varchar(255), "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "gender" varchar(25), "isVerified" bit NOT NULL CONSTRAINT "DF_a25b50790d9e61b9bcfd48a04e6" DEFAULT 0, "isActive" bit NOT NULL CONSTRAINT "DF_ea576ec243c3e01430238207803" DEFAULT 1, "identificationDocument" varchar(255), "identificationDocumentType" varchar(25), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_1410c17c4be3fff551f714fb825" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_53f4ce4896bfa1be267308c6f6b" DEFAULT getdate(), "accountRoleIdId" uniqueidentifier, CONSTRAINT "UQ_429f127100f2c4cb35e5ba85fbf" UNIQUE ("phoneNumber"), CONSTRAINT "PK_bf68fd30f1adeede9c72a5cac09" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "generic_api_db".."Account" ADD CONSTRAINT "FK_228f5d13c74e4c6bbbc7245772b" FOREIGN KEY ("accountRoleIdId") REFERENCES "generic_api_db".."AccountRole"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "generic_api_db".."Account" DROP CONSTRAINT "FK_228f5d13c74e4c6bbbc7245772b"`);
    await queryRunner.query(`DROP TABLE "generic_api_db".."Account"`);
    await queryRunner.query(`DROP TABLE "generic_api_db".."AccountRole"`);
  }
}
