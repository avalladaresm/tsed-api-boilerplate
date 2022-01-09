import {BodyParams, Controller, Delete, Get, PathParams, PlatformResponse, Post, Put, QueryParams, Res} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {Account} from "../entities/Account";
import { SignUpResponse } from "../models/Auth";
import {CustomError} from "../models/CustomError";
import {AccountService} from "../services/Account";
import {DeleteResult} from "typeorm";
import { AccountSecurityQuestion } from "../entities/AccountSecurityQuestion";

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
  @(Returns(201, Account).Groups("read").Description("Returns the instance of the created account"))
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createAccount(
    @BodyParams() @Groups("create") data: Account,
    @Res() response: PlatformResponse
  ): Promise<SignUpResponse | undefined> {
    try {
      const account = await this.accountService.createAccount(data, response);
      return account;
    } catch (e) {
      throw e;
    }
  }

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

  @Put("/account/:id")
  @Summary("Updates an account by id")
  @(Returns(200, Account).Groups("read").Description("Returns the updated instance of the account"))
  async updateAccount(
    @PathParams("id") id: string,
    @BodyParams() @Groups("update") data: Account
  ): Promise<Partial<Account>> {
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

  @Get("/account/securityQuestion/:accountId")
  @Summary("Gets an account by id")
  @(Returns(200, AccountSecurityQuestion).Groups("read").Description("Returns an account security question"))
  async getAccountSecurityQuestion(@PathParams("accountId") accountId: string): Promise<AccountSecurityQuestion | undefined> {
    try {
      const account = await this.accountService.getAccountSecurityQuestion(accountId);
      return account;
    } catch (e) {
      throw e;
    }
  }
}
