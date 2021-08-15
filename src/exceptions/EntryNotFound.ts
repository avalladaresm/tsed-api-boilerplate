import {ResponseErrorObject} from "@tsed/common";
import {NotFound} from "@tsed/exceptions";

export class EntryNotFound extends NotFound implements ResponseErrorObject {
  constructor(message?: string) {
    super(message ?? "Entry not found");
    this.name = "ENTRY_NOT_FOUND";
  }
}
