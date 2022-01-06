import {BodyParams, Controller, PlatformResponse, Post, Res} from "@tsed/common";
import {ContentType, Groups, Put, Returns, Status, Summary} from "@tsed/schema";
import {Account} from "src/entities/Account";
import { ForgotPasswordModel, ResendVerificationEmailModel, SignUpResponse, UpdatePasswordModel, VerificationData, VerifyOtpModel } from "src/models/Auth";
import { CustomError } from "src/models/CustomError";
import {AuthService} from "../services/Auth";

interface LoginFields {
  email: string;
  password: string;
}

@Controller("/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/signin")
  @Summary("Signs in an account")
  @ContentType("application/json")
  async login(@BodyParams("data") data: LoginFields): Promise<any> {
    try {
      const res = await this.authService.signin(data);
      return res;
    } catch (e) {
      throw e;
    }
  }

  @Post('/signup')
  @Summary("Sign up an account")
  @ContentType("application/json")
  @(Returns(201, SignUpResponse).Groups("read").Description("Returns the instance of the created account"))
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async signup(@BodyParams('data') @Groups("create") data: Account, @Res() response: PlatformResponse): Promise<SignUpResponse | undefined> {
    try {
      const res = await this.authService.signup(data, response)
      return res
    } catch (e) {
      throw e;
    }
  }

  @Post('/verify')
  async verify(
    @BodyParams() verificationData: VerificationData,
    @Res () res: PlatformResponse
  ): Promise<PlatformResponse | string | undefined> {
    try {
      const result = await this.authService.verify(verificationData, res)
      return result
    }
    catch (e) {
      throw e
    }
  }

  @Post('/forgotPassword')
  @ContentType('application/json')
  async forgotPassword(
    @BodyParams() forgotPasswordModel: ForgotPasswordModel,
    @Res() res: PlatformResponse
  ): Promise<boolean> {
    try {
      const result = await this.authService.forgotPassword(forgotPasswordModel, res);
      return result;
    }
    catch (e) {
      throw e
    }
  }

  @Post('/verifyOtp')
  @ContentType('application/json')
  async verifyOtp(@BodyParams() verifyOtpModel: VerifyOtpModel): Promise<boolean> {
    try {
      const isValid = await this.authService.verifyOtp(verifyOtpModel)
      return isValid
    }
    catch (e) {
      throw e
    }
  }

  @Post('/resendVerificationEmail')
  @ContentType('application/json')
  async resendVerificationEmail(
    @BodyParams() resendVerificationEmailModel: ResendVerificationEmailModel,
    @Res() response: PlatformResponse
  ): Promise<void> {
    try {
      await this.authService.resendVerificationEmail(resendVerificationEmailModel, response)
    }
    catch (e) {
      throw e
    }
  }

  @Put('/updatePassword')
  @ContentType('application/json')
  async updatePassword(@BodyParams() data: UpdatePasswordModel): Promise<boolean> {
    try {
      const isUpdateSuccessful = await this.authService.updatePassword(data)
      return isUpdateSuccessful
    }
    catch (e) {
      throw e
    }
  }
}
