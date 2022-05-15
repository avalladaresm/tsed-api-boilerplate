import {ResponseErrorObject} from "@tsed/common";
import {NotFound} from "@tsed/exceptions";
import { ErrorResponseProperties } from "src/models/ErrorResponse";

export class EntryNotFound<T> extends NotFound implements ResponseErrorObject {
  constructor(errorObject: ErrorResponseProperties<T>) {
    super(errorObject.message);
    this.body = errorObject;
  }
}
