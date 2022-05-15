import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterAccountUsernameNullable1647958311040 implements MigrationInterface {
    name = 'AlterAccountUsernameNullable1647958311040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AuthLog" DROP CONSTRAINT "FK_AuthLog_username"`);
        await queryRunner.query(`ALTER TABLE "Account" ALTER COLUMN "username" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "AuthLog" ADD CONSTRAINT "FK_AuthLog_username" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AuthLog" DROP CONSTRAINT "FK_AuthLog_username"`);
        await queryRunner.query(`ALTER TABLE "Account" ALTER COLUMN "username" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "AuthLog" ADD CONSTRAINT "FK_AuthLog_username" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
