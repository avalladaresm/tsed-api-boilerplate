import { ResponseErrorObject } from "@tsed/common";
import { BadRequest } from "@tsed/exceptions";

export class MalformedGuid extends BadRequest implements ResponseErrorObject {
  constructor(message?: string) {
    super(message ?? "A malformed GUID was entered.");
    this.name = "MALFORMED_GUID_ERROR";
  }
}
