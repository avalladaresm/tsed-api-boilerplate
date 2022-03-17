import { Next, Req } from '@tsed/common';
import { BadRequest, Exception, Forbidden, Unauthorized } from '@tsed/exceptions';
import { MiddlewareMethods, Middleware } from "@tsed/platform-middlewares";

import jwt from "jsonwebtoken";

@Middleware()
export class AuthenticationRequired implements MiddlewareMethods {
  use(@Req() req: Req, @Next() next: Next) {
    let error: Exception = {} as Exception;
    const accessToken = req.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      error = new Unauthorized('No estás autorizado para ver esta página.')
      error.errors = [{ code: 'E0000', message: 'No estás autorizado para ver esta página.' }]
      throw (error)
    }
    if (!process.env.JWT_SECRET) {
      error = new BadRequest('No se pudo determinar las credenciales!')
      error.errors = [{ code: 'E0013', message: 'No se pudo determinar las credenciales!' }]
      throw (error)
    }

    jwt.verify(accessToken, process.env.JWT_SECRET, (err: any, data: any) => {
      switch (err && err.name) {
        case 'TokenExpiredError':
          throw new Forbidden('Su sesión expiró.')
        case 'JsonWebTokenError':
          console.log(err)
          throw new BadRequest('Se encontró un problema con la data de su sesión.')
        default: {
          req.app.locals.signedData = data
          next()
        }
      }
    })
  }
}