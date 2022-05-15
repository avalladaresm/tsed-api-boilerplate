import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Account} from "./Account";
import { SecurityQuestion } from "./SecurityQuestion";

@Entity({name: "AccountSecurityQuestion"})
@Groups<AccountSecurityQuestion>({
  create: [
    "accountId",
    "securityQuestionId",
    "securityQuestionAnswer"
  ],
  update: [
    "id",
    "accountId",
    "securityQuestionId",
    "securityQuestionAnswer"
  ],
  read: [
    "id",
    "idInc",
    "accountId",
    "securityQuestionId",
    "createdAt",
    "updatedAt"
  ]
})
export class AccountSecurityQuestion {
  @Property()
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc: number;

  @Property()
  accountId: string;

  @OneToOne(() => Account, (account) => account.accountSecurityQuestion, {onDelete: "CASCADE"})
  @JoinColumn({name: "accountId", referencedColumnName: "id"})
  account: Account;

  @Property()
  securityQuestionId: string;

  @Property()
  @Example("Maya")
  @Column("varchar", {length: 1000})
  securityQuestionAnswer: string;

  @OneToOne(() => SecurityQuestion, {eager: true, cascade: ["update"], onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: "securityQuestionId", referencedColumnName: "id"})
  securityQuestion: SecurityQuestion;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt: string;
}
