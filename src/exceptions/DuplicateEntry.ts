import {ResponseErrorObject} from "@tsed/common";
import {Conflict} from "@tsed/exceptions";

export class DuplicateEntry extends Conflict implements ResponseErrorObject {
  constructor(message?: string) {
    const extractedSqlErrorMessageIndex = message?.indexOf("The duplicate key value");
    const extractedSqlErrorMessage = message?.slice(extractedSqlErrorMessageIndex);
    super("Duplicate entry error");
    this.name = "DUP_ENTRY_ERROR";
    this.errors = !!extractedSqlErrorMessage ? [{message: extractedSqlErrorMessage}] : [];
  }
}
