import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSecurityQuestionAccountSecurityQuestion1641736146273 implements MigrationInterface {
    name = 'CreateSecurityQuestionAccountSecurityQuestion1641736146273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "SecurityQuestion" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_SecurityQuestion_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "securityQuestion" varchar(1000) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_SecurityQuestion_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_SecurityQuestion_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_SecurityQuestion_securityQuestion" UNIQUE ("securityQuestion"), CONSTRAINT "PK_SecurityQuestion_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "AccountSecurityQuestion" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_AccountSecurityQuestion_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "accountId" uniqueidentifier NOT NULL, "securityQuestionId" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountSecurityQuestion_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountSecurityQuestion_updatedAt" DEFAULT getdate(), CONSTRAINT "PK_AccountSecurityQuestion_id_accountId_securityQuestionId" PRIMARY KEY ("id", "accountId", "securityQuestionId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_94bfd003d5c14bfb5ee87860c2" ON "AccountSecurityQuestion" ("accountId") WHERE "accountId" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_5a09e443594b7c09e59dd5183d" ON "AccountSecurityQuestion" ("securityQuestionId") WHERE "securityQuestionId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" ADD CONSTRAINT "FK_AccountSecurityQuestion_accountId" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" ADD CONSTRAINT "FK_AccountSecurityQuestion_securityQuestionId" FOREIGN KEY ("securityQuestionId") REFERENCES "SecurityQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" DROP CONSTRAINT "FK_AccountSecurityQuestion_securityQuestionId"`);
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" DROP CONSTRAINT "FK_AccountSecurityQuestion_accountId"`);
        await queryRunner.query(`DROP INDEX "REL_5a09e443594b7c09e59dd5183d" ON "AccountSecurityQuestion"`);
        await queryRunner.query(`DROP INDEX "REL_94bfd003d5c14bfb5ee87860c2" ON "AccountSecurityQuestion"`);
        await queryRunner.query(`DROP TABLE "AccountSecurityQuestion"`);
        await queryRunner.query(`DROP TABLE "SecurityQuestion"`);
    }

}
