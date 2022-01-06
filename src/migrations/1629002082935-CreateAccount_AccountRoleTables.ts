import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAccountAccountRoleTables1629002082935 implements MigrationInterface {
  name = "CreateAccountAccountRoleTables1629002082935";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api-biolerplate".."Role" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_Role_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "name" varchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_Role_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_Role_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_Role_name" UNIQUE ("name"), CONSTRAINT "PK_Role_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "api-biolerplate".."AccountRole" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_AccountRole_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "accountId" uniqueidentifier NOT NULL, "roleName" varchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountRole_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_AccountRole_updatedAt" DEFAULT getdate(), CONSTRAINT "PK_AccountRole_id_accountId_roleName" PRIMARY KEY ("id", "accountId", "roleName"))`
    );
    await queryRunner.query(
      `CREATE TABLE "api-biolerplate".."Account" ("id" uniqueidentifier NOT NULL CONSTRAINT "DFV_Account_id" DEFAULT newid(), "idInc" int NOT NULL IDENTITY(1,1), "username" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "phoneNumber" varchar(25) NOT NULL, "dob" date NOT NULL, "country" varchar(255) NOT NULL, "state" varchar(255), "city" varchar(255), "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "gender" varchar(25), "isVerified" bit NOT NULL CONSTRAINT "DFV_Account_isVerified" DEFAULT 0, "isActive" bit NOT NULL CONSTRAINT "DFV_Account_isActive" DEFAULT 1, "identificationDocument" varchar(255), "identificationDocumentType" varchar(25), "createdAt" datetime2 NOT NULL CONSTRAINT "DFV_Account_createdAt" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DFV_Account_updatedAt" DEFAULT getdate(), CONSTRAINT "UQ_Account_username" UNIQUE ("username"), CONSTRAINT "UQ_identificationDocument" UNIQUE ("identificationDocument"), CONSTRAINT "UQ_email" UNIQUE ("email"), CONSTRAINT "UQ_phoneNumber" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_idInc" UNIQUE ("idInc"), CONSTRAINT "UQ_id" UNIQUE ("id"), CONSTRAINT "PK_Account_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "api-biolerplate".."AccountRole" ADD CONSTRAINT "FK_AccountRole_accountId" FOREIGN KEY ("accountId") REFERENCES "api-biolerplate".."Account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "api-biolerplate".."AccountRole" ADD CONSTRAINT "FK_AccountRole_roleName" FOREIGN KEY ("roleName") REFERENCES "api-biolerplate".."Role"("name") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api-biolerplate".."AccountRole" DROP CONSTRAINT "FK_AccountRole_roleName"`);
    await queryRunner.query(`ALTER TABLE "api-biolerplate".."AccountRole" DROP CONSTRAINT "FK_AccountRole_accountId"`);
    await queryRunner.query(`DROP TABLE "api-biolerplate".."Account"`);
    await queryRunner.query(`DROP TABLE "api-biolerplate".."AccountRole"`);
    await queryRunner.query(`DROP TABLE "api-biolerplate".."Role"`);
  }
}
