import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAuthLog1641431742712 implements MigrationInterface {
    name = 'CreateAuthLog1641431742712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "AuthLog" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_AuthLog_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "username" varchar(255) NOT NULL, "ip" varchar(255) NOT NULL, "osplatform" varchar(255) NOT NULL, "browsername" varchar(255) NOT NULL, "browserversion" varchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_AuthLog_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_AuthLog_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_AuthLog_idInc" UNIQUE ("idInc"), CONSTRAINT "UQ_AuthLog_id" UNIQUE ("id"), CONSTRAINT "PK_AuthLog_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "AuthLog" ADD CONSTRAINT "FK_AuthLog_username" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AuthLog" DROP CONSTRAINT "FK_AuthLog_username"`);
        await queryRunner.query(`DROP TABLE "AuthLog"`);
    }

}
