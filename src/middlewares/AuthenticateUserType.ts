import { Req } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";
var jwt = require('jsonwebtoken');

export class AuthenticateUserType {

  async authenticateUserType(@Req() req: any, userType: any = null, connection: any) {
    if (userType) {
      const profileUserType =
        req.app.locals.mwData.user.userProfile &&
        req.app.locals.mwData.user.userProfile.name &&
        req.app.locals.mwData.user.userProfile.name

      // Verificar si el user type concuerda con uno de los TYPES pasados en esta funcion
      if (Array.isArray(userType)) {
        const typeIndex = userType?.findIndex((type) => type == profileUserType);
        if (typeIndex < 0) {
          throw new Unauthorized('Acceso no autorizado')

        }
      }

      if (typeof userType == "string" && userType != profileUserType) {
        throw new Unauthorized('Acceso no autorizado')
      }
    }
    const user = await connection.query('CALL existsUserWithEmail(?)', [req.app.locals.mwData.user.userProfile.idUser])
    if (!user) {
      throw new Unauthorized('Acceso no autorizado')
    }
    const profile = await connection.query('CALL getUserProfileById(?)', [user.idUserProfile])
    const profileRes = profile[0][0]
    const token = jwt.sign({ profileRes }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });
    req.app.locals.user = user
    req.app.locals.token = token
  }
}
