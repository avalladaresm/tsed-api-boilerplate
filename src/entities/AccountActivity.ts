import {Example, Groups, Property, Required} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn} from "typeorm";
import {BeforeDeserialize} from "@tsed/json-mapper";
import {ValidationError} from "@tsed/common";
import { Account } from "./Account";
import { Activity } from "./Activity";
import { ActivityType } from "../models/Activity";

@BeforeDeserialize((data: Record<string, unknown>) => {
  if (!data.otpHash) {
    const error = new ValidationError("Validation error", [{message: "Field 'otpHash' is required."}]);
    throw error;
  } else {
    return data;
  }
})
@Groups<AccountActivity>({
  create: [
    "username",
    "activityType",
    "ip",
    "osPlatform",
    "browserName",
    "browserVersion"
  ],
  read: [
    "id",
    "idInc",
    "username",
    "activityType",
    "ip",
    "osPlatform",
    "browserName",
    "browserVersion",
    "createdAt",
    "updatedAt"
  ]
})
@Entity({name: "AccountActivity", orderBy: { createdAt: "DESC" }})
@Unique("UQ_AccountActivity_id", ["id"])
@Unique("UQ_AccountActivity_idInc", ["idInc"])
export class AccountActivity {
  @Property()
  @Example("31E95D0A-5975-11EC-B6E2-BEA124E1A9D8")
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id?: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc?: number;

  @Property()
  @PrimaryColumn()
  accountId: string;

  @Column("varchar", { length: 255, nullable: false })
  @Required()
  @Property()
  username: string;

  @Column("varchar", { length: 255, nullable: true })
  @Required()
  @Property()
  targetUsername: string;

  @ManyToOne(() => Account, { onDelete: "CASCADE" })
  @JoinColumn({name: "accountId", referencedColumnName: "id"})
  account: Account;

  @PrimaryColumn()
  @Example("sign_in")
  @Property()
  activityType: ActivityType;

  @ManyToOne(() => Activity, {eager: true, onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: "activityType", referencedColumnName: "activityType"})
  activity: Activity;

  @Property()
  @Example("192.168.1.102")
  @Column("varchar", { length: 255, nullable: true })
  ip: string;

  @Property()
  @Example("Windows")
  @Column("varchar", { length: 255, nullable: true })
  osPlatform: string;

  @Property()
  @Example("Chrome")
  @Column("varchar", { length: 255, nullable: true })
  browserName: string;

  @Property()
  @Example("v90")
  @Column("varchar", { length: 255, nullable: true })
  browserVersion: string;

  @Property()
  @Example("2021-08-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt?: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt?: string;
}
