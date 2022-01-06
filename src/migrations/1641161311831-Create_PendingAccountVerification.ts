import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePendingAccountVerification1641161311831 implements MigrationInterface {
    name = 'CreatePendingAccountVerification1641161311831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "PendingAccountVerification" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_PendingAccountVerification_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "accountId" uniqueidentifier NOT NULL, "accessToken" varchar(1024) NOT NULL, "exp" datetime NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_PendingAccountVerification_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_PendingAccountVerification_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_PendingAccountVerification_idInc" UNIQUE ("idInc"), CONSTRAINT "UQ_PendingAccountVerification_id" UNIQUE ("id"), CONSTRAINT "PK_PendingAccountVerification_id_accountId" PRIMARY KEY ("id", "accountId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_fa2733789eba360de17c2e3c5f" ON "PendingAccountVerification" ("accountId") WHERE "accountId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PendingAccountVerification" ADD CONSTRAINT "FK_PendingAccountVerification_accountId" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PendingAccountVerification" DROP CONSTRAINT "FK_PendingAccountVerification_accountId"`);
        await queryRunner.query(`DROP INDEX "REL_fa2733789eba360de17c2e3c5f" ON "PendingAccountVerification"`);
        await queryRunner.query(`DROP TABLE "PendingAccountVerification"`);
    }

}
