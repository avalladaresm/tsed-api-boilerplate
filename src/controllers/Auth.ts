import {BodyParams, Controller, PlatformRequest, PlatformResponse, Post, QueryParams, Req, Res} from "@tsed/common";
import {ContentType, Get, Groups, Put, Returns, Status, Summary} from "@tsed/schema";
import {Account} from "../entities/Account";
import { ForgotPasswordModel, ResendVerificationEmailModel, SignInModel, SignInResult, SignUpResponse, UpdatePasswordModel, VerifyOtpModel } from "../models/Auth";
import { CustomError } from "../models/CustomError";
import {AuthService} from "../services/Auth";
import parser from "ua-parser-js";
import { PlatformModel } from "../models/Platform";


@Controller("/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/signin")
  @Summary("Signs in an account")
  @ContentType("application/json")
  async login(@BodyParams() data: SignInModel, @Req() req: PlatformRequest): Promise<SignInResult> {
    try {
      const platform: PlatformModel = {userAgent: parser(req.headers["user-agent"]), ip: req.headers["X-Forwarded-For"]?.toString() ?? ""}
      const res = await this.authService.signin(data, platform);
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

  @Get('/verify')
  async verify(
    @QueryParams('id') accountId: string,
    @QueryParams('accessToken') accessToken: string,
    @Res () res: PlatformResponse
  ): Promise<boolean> {
    try {
      const result = await this.authService.verify(accountId, accessToken, res)
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
