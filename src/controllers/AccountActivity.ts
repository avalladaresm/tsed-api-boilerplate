import {BodyParams, Controller, Delete, Get, PathParams, Post, Put} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {AccountActivity} from "../entities/AccountActivity";
import {CustomError} from "../models/CustomError";
import {AccountActivityService} from "../services/AccountActivity";
import {DeleteResult, InsertResult} from "typeorm";

@Controller("/")
export class AccountActivityController {
  constructor(private accountActivityService: AccountActivityService) {}

  @Get("/accountActivities")
  @Summary("Gets all account activities")
  @(Returns(200, AccountActivity).Groups("read").Description("Returns an array of account activities"))
  async getAllAccountActivities(): Promise<AccountActivity[]> {
    try {
      const accountActivities = await this.accountActivityService.getAllAccountActivities();
      return accountActivities;
    } catch (e) {
      throw e;
    }
  }

  @Post("/accountActivity")
  @Summary("Creates an account activity")
  @(Returns(201, AccountActivity).Groups("read").Description("Returns the instance of the created account activity"))
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createAccountActivity(@BodyParams() @Groups("create") data: AccountActivity): Promise<InsertResult> {
    try {
      const accountActivity = await this.accountActivityService.createAccountActivity(data);
      return accountActivity;
    } catch (e) {
      throw e;
    }
  }

  @Put("/accountActivity/:id")
  @Summary("Updates an account activity by id")
  @(Returns(200, AccountActivity).Groups("read").Description("Returns the updated instance of the account activity"))
  async updateAccountActivity(@PathParams("id") id: string, @BodyParams() @Groups("update") data: AccountActivity): Promise<Partial<AccountActivity>> {
    try {
      const accountActivity = await this.accountActivityService.updateAccountActivity(id, data);
      return accountActivity;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/accountActivity/:id")
  @Summary("Deletes an account activity by id")
  @(Returns(200, AccountActivity).Description("An account activity has been deleted successfully"))
  async deleteAccountActivity(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const accountActivity = await this.accountActivityService.deleteAccountActivity(id);
      return accountActivity;
    } catch (e) {
      throw e;
    }
  }
}
