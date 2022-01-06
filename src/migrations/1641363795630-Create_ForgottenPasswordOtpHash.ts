import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateForgottenPasswordOtpHash1641363795630 implements MigrationInterface {
    name = 'CreateForgottenPasswordOtpHash1641363795630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ForgottenPasswordOtpHash" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_ForgottenPasswordOtpHash_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "email" varchar(255) NOT NULL, "otpHash" varchar(1024) NOT NULL, "exp" datetime2 NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_ForgottenPasswordOtpHash_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_ForgottenPasswordOtpHash_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_ForgottenPasswordOtpHash_email" UNIQUE ("email"), CONSTRAINT "UQ_ForgottenPasswordOtpHash_idInc" UNIQUE ("idInc"), CONSTRAINT "UQ_ForgottenPasswordOtpHash_id" UNIQUE ("id"), CONSTRAINT "PK_ForgottenPasswordOtpHash_id_email" PRIMARY KEY ("id", "email"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_199d86c498a8f855ebcb554bee" ON "ForgottenPasswordOtpHash" ("email") WHERE "email" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ForgottenPasswordOtpHash" ADD CONSTRAINT "FK_ForgottenPasswordOtpHash_email" FOREIGN KEY ("email") REFERENCES "Account"("email") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ForgottenPasswordOtpHash" DROP CONSTRAINT "FK_ForgottenPasswordOtpHash_email"`);
        await queryRunner.query(`DROP INDEX "REL_199d86c498a8f855ebcb554bee" ON "ForgottenPasswordOtpHash"`);
        await queryRunner.query(`DROP TABLE "ForgottenPasswordOtpHash"`);
    }

}
