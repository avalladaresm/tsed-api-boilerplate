import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Role} from "./Role";
import {Account} from "./Account";

@Entity({name: "AccountRole"})
@Groups<AccountRole>({
  read: [
    "id",
    "idInc",
    "roleName",
    "createdAt",
    "updatedAt"
  ]
})
export class AccountRole {
  @Property()
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc: number;

  @PrimaryColumn()
  accountId: string;

  @Property()
  @ManyToOne(() => Account, (account) => account.accountRoles, {onDelete: "CASCADE"})
  account: Account;

  @PrimaryColumn()
  @Property()
  roleName: string;

  @Property()
  @ManyToOne(() => Role, {eager: true, onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: "roleName", referencedColumnName: "name"})
  role: Role;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt: string;
}
