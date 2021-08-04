import {Column, CreateDateColumn, Entity, Generated, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Account} from "./Account";

@Entity({name: "AccountRole"})
export class AccountRole {
  @PrimaryGeneratedColumn("uuid", {name: "id"})
  id: string;

  @Generated("increment")
  idInc: number;

  @OneToMany(() => Account, (account) => account.accountRoleId)
  accounts: Account[];

  @Column("varchar", {length: 255, unique: true})
  name: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
