import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateActivityAccountActivity1641846966992 implements MigrationInterface {
    name = 'CreateActivityAccountActivity1641846966992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Activity" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_Activity_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "activityType" varchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_Activity_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_Activity_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_Activity_activityType" UNIQUE ("activityType"), CONSTRAINT "PK_Activity_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "AccountActivity" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_AccountActivity_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "accountId" uniqueidentifier NOT NULL, "username" varchar(255) NOT NULL, "targetUsername" varchar(255), "activityType" varchar(255) NOT NULL, "ip" varchar(255), "osPlatform" varchar(255), "browserName" varchar(255), "browserVersion" varchar(255), "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountActivity_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountActivity_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_AccountActivity_idInc" UNIQUE ("idInc"), CONSTRAINT "UQ_AccountActivity_id" UNIQUE ("id"), CONSTRAINT "PK_AccountActivity_id_accountId_activityType" PRIMARY KEY ("id", "accountId", "activityType"))`);
        await queryRunner.query(`ALTER TABLE "AccountActivity" ADD CONSTRAINT "FK_AccountActivity_accountId" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "AccountActivity" ADD CONSTRAINT "FK_AccountActivity_activityType" FOREIGN KEY ("activityType") REFERENCES "Activity"("activityType") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AccountActivity" DROP CONSTRAINT "FK_AccountActivity_activityType"`);
        await queryRunner.query(`ALTER TABLE "AccountActivity" DROP CONSTRAINT "FK_AccountActivity_accountId"`);
        await queryRunner.query(`DROP TABLE "AccountActivity"`);
        await queryRunner.query(`DROP TABLE "Activity"`);
    }

}
