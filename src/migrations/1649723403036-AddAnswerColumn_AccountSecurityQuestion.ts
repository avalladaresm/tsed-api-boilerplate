import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAnswerColumnAccountSecurityQuestion1649723403036 implements MigrationInterface {
    name = 'AddAnswerColumnAccountSecurityQuestion1649723403036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" ALTER COLUMN "securityQuestionAnswer" varchar(1000) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AccountSecurityQuestion" ALTER COLUMN "securityQuestionAnswer" varchar(1000)`);
    }

}
