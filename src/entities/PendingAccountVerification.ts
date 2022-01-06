import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique, UpdateDateColumn} from "typeorm";
import {BeforeDeserialize} from "@tsed/json-mapper";
import {ValidationError} from "@tsed/common";
import { Account } from "./Account";

@BeforeDeserialize((data: Record<string, unknown>) => {
  if (!data.accessToken) {
    const error = new ValidationError("Validation error", [{message: "Field 'accessToken' is required."}]);
    throw error;
  } else {
    return data;
  }
})
@Groups<PendingAccountVerification>({
  create: [
    "accountId",
    "accessToken",
    "exp"
  ],
  read: [
    "id",
    "idInc",
    "accessToken",
    "accountId",
    "exp",
    "createdAt",
    "updatedAt"
  ]
})
@Entity({name: "PendingAccountVerification"})
@Unique("UQ_PendingAccountVerification_id", ["id"])
@Unique("UQ_PendingAccountVerification_idInc", ["idInc"])
export class PendingAccountVerification {
  @Property()
  @Example("31E95D0A-5975-11EC-B6E2-BEA124E1A9D8")
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id?: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc?: number;

  @PrimaryColumn()
  accountId: string;

  @OneToOne(() => Account, (account) => account.pendingAccountVerification)
  @JoinColumn({name: "accountId", referencedColumnName: "id"})
  account?: Account;

  @Property()
  @Example("eyJhb...2HFEo")
  @Column("varchar", {length: 1024, nullable: false})
  accessToken: string;
  
  @Property()
  @Example("2021-12-01T06:29:58.550Z")
  @Column("datetime2")
  exp: Date;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt?: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt?: string;
}
