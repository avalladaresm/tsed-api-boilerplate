import { Property, Schema } from "@tsed/schema";
import { Account } from "../entities/Account";
import jwt from "jsonwebtoken";


class OnlyEmailModel {
  @Property()
  email: string;
}

@Schema({})
export class SignUpResponse {
  @Property()
  account: Account | undefined;

  @Property()
  accessToken: string;
}

@Schema({})
export class AuthenticationData {
  @Property()
  accountId: string;
  
  @Property()
  role: string | string[];
  
  @Property()
  email: string;
}

@Schema({})
export class SignedAuthenticationJWTData {
  @Property()
  signedData: AuthenticationData;

  @Property()
  jwtPayload: jwt.JwtPayload;
}

@Schema({})
export class VerificationData {
  @Property()
  accountId: string;

  @Property()
  accessToken: string;
}

@Schema({})
export class ForgotPasswordModel extends OnlyEmailModel {}

@Schema({})
export class ResendVerificationEmailModel extends OnlyEmailModel {}

@Schema({})
export class VerifyOtpModel {
  @Property()
  otp: string;

  @Property()
  email: string;
}

@Schema({})
export class UpdatePasswordModel {
  @Property()
  email: string;

  @Property()
  newPassword: string;
}

