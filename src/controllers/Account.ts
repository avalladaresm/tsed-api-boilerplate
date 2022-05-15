import {BodyParams, Controller, Delete, Get, PathParams, PlatformResponse, Post, Put, QueryParams, Res, UseBefore} from "@tsed/common";
import {ContentType, Groups, Returns, Status, Summary} from "@tsed/schema";
import {Account} from "../entities/Account";
import {CustomError} from "../models/CustomError";
import {AccountService} from "../services/Account";
import {DeleteResult} from "typeorm";
import { AccountSecurityQuestion } from "../entities/AccountSecurityQuestion";
import { AuthenticationRequired } from "src/middlewares/AuthenticationRequired";
import { AccountActivity } from "src/entities/AccountActivity";
import { CreatedAccountResponse } from "src/models/Account";
import { ErrorResponse } from "src/models/ErrorResponse";
import { SuccessResponse } from "src/models/SuccessResponse";
import { SecurityQuestion } from "src/entities/SecurityQuestion";

@Controller("/")
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get("/accounts")
  @Summary("Gets all accounts")
  @(Returns(200, Account).Groups("read").Description("Returns an array of accounts"))
  async getAllAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.accountService.getAllAccounts();
      return accounts;
    } catch (e) {
      throw e;
    }
  }

  @Post("/account")
  @Summary("Creates an account")
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  @(Status(401, CustomError).Description("Validation error or data is malformed"))
  async createAccount(
    @BodyParams() @Groups("create") data: Account,
    @Res() response: PlatformResponse
  ): Promise<ErrorResponse<CreatedAccountResponse> | SuccessResponse<CreatedAccountResponse>> {
    try {
      const account = await this.accountService.createAccount(data, response);
      return account;
    } catch (e) {
      throw e;
    }
  }

  @UseBefore(AuthenticationRequired)
  @Get("/account/:id")
  @Summary("Gets an account by id")
  @(Returns(200, Account).Groups("read").Description("Returns an account by id"))
  async getAccountById(@PathParams("id") id: string): Promise<Account | undefined> {
    try {
      const account = await this.accountService.getAccountById(id);
      return account;
    } catch (e) {
      throw e;
    }
  }

  @Get("/account")
  @Summary("Gets an account by email")
  @(Returns(200, Account).Groups("read").Description("Returns an account by email"))
  async getAccountByEmail(@QueryParams("email") email: string): Promise<Account | undefined> {
    try {
      const account = await this.accountService.getAccountByEmail(email);
      return account;
    } catch (e) {
      throw e;
    }
  }

  @Get("/account/:accountId/account-roles")
  @Summary("Gets an account by id")
  @(Returns(200, AccountSecurityQuestion).Groups("read").Description("Returns an account security question"))
  async getAccountRoles(@PathParams("accountId") accountId: string): Promise<string[] | undefined> {
    try {
      const accountRoles = await this.accountService.getAccountRoles(accountId);
      return accountRoles;
    } catch (e) {
      throw e;
    }
  }

  @Get("/account/:accountId/security-question")
  @Summary("Gets an account security question by id")
  async getAccountSecurityQuestion(@PathParams("accountId") accountId: string): Promise<ErrorResponse<SecurityQuestion> | SuccessResponse<SecurityQuestion>> {
    try {
      const securityQuestion = await this.accountService.getAccountSecurityQuestion(accountId);
      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }

  @UseBefore(AuthenticationRequired)
  @Post('/account/verify-password')
  @ContentType('application/json')
  async verifyAccountPassword(@BodyParams("password") password: string): Promise<ErrorResponse<boolean> | SuccessResponse<boolean>> {
    try {
      const isValid = await this.accountService.verifyAccountPassword(password)
      return isValid
    }
    catch (e) {
      throw e
    }
  }

  @UseBefore(AuthenticationRequired)
  @Get("/account/accountActivities/:accountId")
  @Summary("Gets an account by id")
  @(Returns(200, AccountActivity).Groups("read").Description("Returns the activities of a specific account"))
  async getAccountActivities(@PathParams("accountId") accountId: string): Promise<AccountActivity[] | undefined> {
    try {
      const accountActivities = await this.accountService.getAccountActivities(accountId);
      return accountActivities;
    } catch (e) {
      throw e;
    }
  }

  @Put("/account/profile")
  @Summary("Updates an account by id")
  async updateAccountProfile(@BodyParams() @Groups("update") data: Account): Promise<ErrorResponse<Account | null> | SuccessResponse<Account | null>> {
    try {
      const account = await this.accountService.updateAccountProfile(data);
      return account;
    } catch (e) {
      throw e;
    }
  }

  @Put("/account/:id")
  @Summary("Updates an account by id")
  @(Returns(200, Account).Groups("read").Description("Returns the updated instance of the account"))
  async updateAccount(
    @PathParams("id") id: string,
    @BodyParams() @Groups("update") data: Account
  ): Promise<ErrorResponse<Account | null> | SuccessResponse<Account | null>> {
    try {
      const account = await this.accountService.updateAccount(id, data);
      return account;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/account/:id")
  @Summary("Deletes an account by id")
  @(Returns(200).Description("An account has been deleted successfully."))
  async deleteAccount(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const account = await this.accountService.deleteAccount(id);
      return account;
    } catch (e) {
      throw e;
    }
  }
}
