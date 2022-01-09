import { Property, Schema } from "@tsed/schema";
import parser from "ua-parser-js";

@Schema({})
export class PlatformModel {
  @Property()
  ip: string;

  @Property()
  userAgent: parser.IResult;
}