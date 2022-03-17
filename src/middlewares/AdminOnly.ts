import { IMiddleware, Middleware, Next, Req } from '@tsed/common';
import { BadRequest, Forbidden, Unauthorized } from '@tsed/exceptions';
import jwt from "jsonwebtoken";

@Middleware()
export class AdminOnly implements IMiddleware {
  use(@Req() req: Req, @Next() next: Next) {
    if (req.app.locals.signedData?.dataToSign.userRoleId != 1) {
      let error;
      error = new Forbidden('No tienes acceso a esta página')
      error.errors = [{ code: 'EACC001' }]
      throw (error)
    }
    next()
  }
}