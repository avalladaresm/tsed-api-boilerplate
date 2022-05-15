import {Property, Schema} from "@tsed/schema";

@Schema({})
export class ErrorResponse<T = null> {
  @Property()
  apiResult: ErrorResponseProperties<T>;
}

@Schema({})
export class ErrorResponseProperties<T> {
  @Property()
  canNotify?: boolean;

  @Property()
  code: string;
  
  @Property()
  exceptionType?: ExceptionType;
  
  @Property()
  message: string;
  
  @Property()
  responseResult?: "error";
  
  @Property()
  status: number;

  @Property()
  value: T | null;
}


export type ExceptionType = 
 | "DuplicateEntry"
 | "EntryNotFound"
 | "MalformedGuid"
 | "EnvVarException"