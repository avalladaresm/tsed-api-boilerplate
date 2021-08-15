import {Property, Schema} from "@tsed/schema";

@Schema({})
export class CustomError {
  @Property()
  name: string;

  @Property()
  message: string;

  @Property()
  status: string;

  @Property()
  errors: string;
}
