import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn} from "typeorm";
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
@Groups<AuthLog>({
  create: [
    "username",
    "ip",
    "osplatform",
    "browsername",
    "browserversion"
  ],
  read: [
    "id",
    "idInc",
    "username",
    "ip",
    "osplatform",
    "browsername",
    "browserversion",
    "createdAt",
    "updatedAt"
  ]
})
@Entity({name: "AuthLog"})
@Unique("UQ_AuthLog_id", ["id"])
@Unique("UQ_AuthLog_idInc", ["idInc"])
export class AuthLog {
  @Property()
  @Example("31E95D0A-5975-11EC-B6E2-BEA124E1A9D8")
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id?: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc?: number;

  @Column("varchar", {length: 255, nullable: false})
  username: string;

  @Property()
  @ManyToOne(() => Account, { onDelete: "CASCADE" })
  @JoinColumn({name: "username", referencedColumnName: "username"})
  account: Account;

  @Property()
  @Example("192.168.1.102")
  @Column("varchar", { length: 255, nullable: false })
  ip: string;

  @Property()
  @Example("Windows")
  @Column("varchar", { length: 255, nullable: false })
  osplatform: string;

  @Property()
  @Example("Chrome")
  @Column("varchar", { length: 255, nullable: false })
  browsername: string;

  @Property()
  @Example("v90")
  @Column("varchar", { length: 255, nullable: false })
  browserversion: string;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt?: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt?: string;
}
