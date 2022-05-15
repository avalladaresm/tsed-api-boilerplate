import {Property, Schema} from "@tsed/schema";

@Schema({})
export class SuccessResponse<T = null> {
  @Property()
  apiResult: SuccessResponseProperties<T>;
}

@Schema({})
export class SuccessResponseProperties<T> {
  @Property()
  canNotify?: boolean;

  @Property()
  code: string;

  @Property()
  message: string;
  
  @Property()
  status: number;
  
  @Property()
  responseResult?: "success" | "error";

  @Property()
  value: T;
}
