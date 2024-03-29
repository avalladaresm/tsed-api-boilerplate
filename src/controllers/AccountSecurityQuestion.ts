import {BodyParams, Controller, Delete, Get, PathParams, Post, Put} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {AccountSecurityQuestion} from "../entities/AccountSecurityQuestion";
import {CustomError} from "../models/CustomError";
import {AccountSecurityQuestionService} from "../services/AccountSecurityQuestion";
import {DeleteResult} from "typeorm";
import { ErrorResponse } from "src/models/ErrorResponse";
import { SuccessResponse } from "src/models/SuccessResponse";

@Controller("/")
export class AccountSecurityQuestionController {
  constructor(private accountSecurityQuestionService: AccountSecurityQuestionService) {}

  @Get("/accountSecurityQuestions")
  @Summary("Gets all account security questions")
  @(Returns(200, AccountSecurityQuestion).Groups("read").Description("Returns an array of account security questions"))
  async getAllAccountSecurityQuestions(): Promise<AccountSecurityQuestion[]> {
    try {
      const accountSecurityQuestions = await this.accountSecurityQuestionService.getAllAccountSecurityQuestions();
      return accountSecurityQuestions;
    } catch (e) {
      throw e;
    }
  }

  @Post("/account-security-question")
  @Summary("Creates an account security question")
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createAccountSecurityQuestion(@BodyParams() @Groups("create") data: AccountSecurityQuestion): Promise<ErrorResponse<AccountSecurityQuestion | null> | SuccessResponse<AccountSecurityQuestion | null>> {
    try {
      const accountSecurityQuestion = await this.accountSecurityQuestionService.createAccountSecurityQuestion(data);
      return accountSecurityQuestion;
    } catch (e) {
      throw e;
    }
  }

  @Put("/account-security-question/:id")
  @Summary("Updates an account security question by id")
  async updateAccountSecurityQuestion(@PathParams("id") id: string, @BodyParams() @Groups("update") data: AccountSecurityQuestion): Promise<ErrorResponse | SuccessResponse> {
    try {
      const accountSecurityQuestion = await this.accountSecurityQuestionService.updateAccountSecurityQuestion(id, data);
      return accountSecurityQuestion;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/accountSecurityQuestion/:id")
  @Summary("Deletes an account security question by id")
  @(Returns(200, AccountSecurityQuestion).Description("An account security question has been deleted successfully"))
  async deleteAccountSecurityQuestion(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const accountSecurityQuestion = await this.accountSecurityQuestionService.deleteAccountSecurityQuestion(id);
      return accountSecurityQuestion;
    } catch (e) {
      throw e;
    }
  }
}
