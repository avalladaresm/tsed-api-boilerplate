import {Catch, ExceptionFilterMethods, PlatformContext, ResourceNotFound} from "@tsed/common";

/*
 * https://tsed.io/docs/exceptions.html#_404-resourcenotfound
 */
@Catch(ResourceNotFound)
export class ResourceNotFoundFilter implements ExceptionFilterMethods {
  async catch(exception: ResourceNotFound, ctx: PlatformContext): Promise<void> {
    const {response} = ctx;

    const obj = {
      status: exception.status,
      message: exception.message,
      url: exception.url
    };
    response.status(exception.status).body(obj);
  }
}
