import {Example, Hidden, Property, Required} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {AccountRole} from "./AccountRole";

@Entity({name: "Account"})
export class Account {
  @Property()
  @Example("525A60BE-6AF5-EB11-B563-DC984098D2B6")
  @PrimaryGeneratedColumn("uuid", {name: "id"})
  id: string;

  @Property()
  @Example("1")
  @Generated("increment")
  idInc: number;

  @Property()
  @Example("2")
  @ManyToOne(() => AccountRole, (accountRole) => accountRole.id)
  accountRole: AccountRole;

  @Property()
  @Example("Daryl Schultz")
  @Column("varchar", {length: 255, nullable: false})
  name: string;

  @Property()
  @Example("+1 (933) 071-1910")
  @Column("varchar", {length: 25, unique: true, nullable: false})
  phoneNumber: string;

  @Property()
  @Example("2021-07-13")
  @Column("date", {nullable: false})
  dob: string;

  @Property()
  @Example("Latvia")
  @Required()
  @Column("varchar", {length: 255, nullable: false})
  country: string;

  @Property()
  @Example("")
  @Column("varchar", {length: 255, nullable: true})
  state: string;

  @Property()
  @Example("")
  @Column("varchar", {length: 255, nullable: true})
  city: string;

  @Property()
  @Example("Jonas23@yahoo.com")
  @Column("varchar", {length: 255, nullable: false})
  email: string;

  @Property()
  @Hidden()
  @Column("varchar", {length: 255, nullable: false})
  password: string;

  @Property()
  @Example("Female")
  @Column("varchar", {length: 25, nullable: true})
  gender: string;

  @Property()
  @Example(false)
  @Column("bit", {default: 0})
  isVerified: boolean;

  @Property(true)
  @Column("bit", {default: 1})
  isActive: boolean;

  @Property()
  @Example("28938923")
  @Column("varchar", {length: 255, nullable: true})
  identificationDocument: string;

  @Property()
  @Example("Driver's License")
  @Column("varchar", {length: 25, nullable: true})
  identificationDocumentType: string;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt: string;
}
