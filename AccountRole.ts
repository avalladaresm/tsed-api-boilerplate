import {Ignore, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Account} from "./Account";
import {Role} from "./Role";

@Entity({name: "AccountRole"})
export class AccountRole {
  @Property()
  @Ignore()
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id: string;

  @Property()
  @Ignore()
  @Column("int", {generated: "increment"})
  idInc: number;

  @Property()
  @OneToMany(() => Account, (account) => account)
  account: Account;

  @Property()
  @OneToMany(() => Role, (role) => role)
  role: Role[];

  @Property()
  @Ignore()
  @CreateDateColumn()
  createdAt: string;

  @Property()
  @Ignore()
  @UpdateDateColumn()
  updatedAt: string;
}
