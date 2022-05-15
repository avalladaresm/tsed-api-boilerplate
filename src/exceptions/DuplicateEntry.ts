import {ResponseErrorObject} from "@tsed/common";
import {Conflict} from "@tsed/exceptions";
import { ErrorResponseProperties } from "src/models/ErrorResponse";

export class DuplicateEntry<T> extends Conflict implements ResponseErrorObject {
  constructor(errorObject: ErrorResponseProperties<T>) {
    super(errorObject.message);
    this.body = errorObject;
  }
}
