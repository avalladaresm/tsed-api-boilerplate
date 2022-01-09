import {Example, Groups, Property} from "@tsed/schema";
import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";

@Groups<Activity>({
  create: ["activityType"],
  update: ["activityType"],
  read: ["id", "idInc", "activityType", "createdAt", "updatedAt"]
})
@Entity({name: "Activity"})
export class Activity {
  @Property()
  @Example("525A60BF-6AF6-EB11-B566-DC984098D2B7")
  @PrimaryColumn("uuid", {name: "id", default: () => "newid()"})
  id: string;

  @Property()
  @Example("1")
  @Column("int", {generated: "increment"})
  idInc: number;

  @Property()
  @Example("sign_in")
  @Column("varchar", {length: 255, unique: true})
  activityType: string;

  @Property()
  @Example("2021-10-05T03:27:18.690Z")
  @CreateDateColumn()
  createdAt: string;

  @Property()
  @Example("2021-11-05T03:27:18.690Z")
  @UpdateDateColumn()
  updatedAt: string;
}
