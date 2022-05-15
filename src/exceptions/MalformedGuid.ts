import { ResponseErrorObject } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";
import { ErrorResponseProperties } from "src/models/ErrorResponse";

export class MalformedGuid<T> extends BadRequest implements ResponseErrorObject {
  constructor(errorObject: ErrorResponseProperties<T>) {
    super(errorObject.message ?? "A malformed GUID was entered.");
    this.body = errorObject;
  }
}
