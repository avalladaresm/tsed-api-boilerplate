import {Catch, PlatformContext, ExceptionFilterMethods, ResponseErrorObject} from "@tsed/common";
import {Exception} from "@tsed/exceptions";
import { DuplicateEntry } from "./DuplicateEntry";
import { EntryNotFound } from "./EntryNotFound";
import { EnvVarException } from "./EnvVarException";

@Catch(EntryNotFound, DuplicateEntry, EnvVarException)
export class APIExceptionFilter implements ExceptionFilterMethods {
  catch(exception: Exception, ctx: PlatformContext) {
    const {response, logger} = ctx;
    const error = this.mapError(exception);
    const headers = this.getHeaders(exception);

    logger.error({
      error
    });

    response
      .setHeaders(headers)
      .status(error.apiResult.status)
      .body(error);
  }
  mapError(error: any) {
    return {
      apiResult: error.body
    };
  }

  protected getHeaders(error: any) {
    return [error, error.origin].filter(Boolean).reduce((obj, {headers}: ResponseErrorObject) => {
      return {
        ...obj,
        ...(headers || {})
      };
    }, {});
  }
}