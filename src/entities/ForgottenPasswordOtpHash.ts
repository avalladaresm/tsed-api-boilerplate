import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique, UpdateDateColumn} from "typeorm";
import {BeforeDeserialize} from "@tsed/json-mapper";
import {ValidationError} from "@tsed/common";
import { Account } from "./Account";

@BeforeDeserialize((data: Record<string, unknown>) => {
  if (!data.otpHash) {
    const error = new ValidationError("Validation error", [{message: "Field 'otpHash' is required."}]);
    throw error;
  } else {
    return data;
  }
})
@Groups<ForgottenPasswordOtpHash>({
  create: [
    "email",
    "otpHash",
    "exp"
  ],
  read: [
    "id",
    "idInc",
    "otpHash",
    "email",
    "exp",
    "createdAt",
    "updatedAt"
  ]
})
@Entity({name: "ForgottenPasswordOtpHash"})
@Unique("UQ_ForgottenPasswordOtpHash_id", ["id"])
@Unique("UQ_ForgottenPasswordOtpHash_idInc", ["idInc"])
@Unique("UQ_ForgottenPasswordOtpHash_email", ["email"])
export class ForgottenPasswordOtpHash {
  @Property()
  @Example("31E95D0A-5975-11EC-B6E2-BEA124E1A9D8")
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id?: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc?: number;

  @PrimaryColumn()
  email: string;

  @OneToOne(
    () => Account, 
    (account) => account.forgottenPasswordOtpHash,
    {
      onUpdate: "CASCADE",
      onDelete: "CASCADE" 
    }
  )
  @JoinColumn({name: "email", referencedColumnName: "email"})
  account?: Account;

  @Property()
  @Example("eyJhb...2HFEa")
  @Column("varchar", {length: 1024, nullable: false})
  otpHash: string;
  
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
