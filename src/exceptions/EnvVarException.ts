import {ResponseErrorObject} from "@tsed/common";
import {BadRequest} from "@tsed/exceptions";
import { ErrorResponseProperties } from "src/models/ErrorResponse";

export class EnvVarException<T> extends BadRequest implements ResponseErrorObject {
  constructor(errorObject: ErrorResponseProperties<T>) {
    super(errorObject.message);
    this.body = errorObject;
  }
}
