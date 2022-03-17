import { Next, Req } from '@tsed/common';
import { Forbidden } from '@tsed/exceptions';
import { MiddlewareMethods, Middleware } from "@tsed/platform-middlewares";

@Middleware()
export class AdminOnly implements MiddlewareMethods {
  use(@Req() req: Req, @Next() next: Next) {
    if (req.app.locals.signedData?.dataToSign.userRoleId != 1) {
      const error = new Forbidden('No tienes acceso a esta página')
      error.errors = [{ code: 'EACC001' }]
      throw (error)
    }
    next()
  }
}