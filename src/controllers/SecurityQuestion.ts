import {BodyParams, Controller, Delete, Get, PathParams, Post, Put} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {SecurityQuestion} from "../entities/SecurityQuestion";
import {CustomError} from "../models/CustomError";
import {SecurityQuestionService} from "../services/SecurityQuestion";
import {DeleteResult} from "typeorm";
import { ErrorResponse } from "src/models/ErrorResponse";
import { SuccessResponse } from "src/models/SuccessResponse";

@Controller("/")
export class SecurityQuestionController {
  constructor(private securityQuestionService: SecurityQuestionService) {}

  @Get("/security-questions")
  @Summary("Gets all security questions")
  @(Returns(200, SecurityQuestion).Groups("read").Description("Returns an array of security questions"))
  async getAllSecurityQuestions(): Promise<SecurityQuestion[]> {
    try {
      const securityQuestions = await this.securityQuestionService.getAllSecurityQuestions();
      return securityQuestions;
    } catch (e) {
      throw e;
    }
  }

  @Post("/security-question")
  @Summary("Creates a security question")
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createSecurityQuestion(@BodyParams() @Groups("create") data: SecurityQuestion): Promise<ErrorResponse<SecurityQuestion> | SuccessResponse<SecurityQuestion>> {
    try {
      const securityQuestion = await this.securityQuestionService.createSecurityQuestion(data);
      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }

  @Put("/security-question/:id")
  @Summary("Updates a security question by id")
  @(Returns(200, SecurityQuestion).Groups("read").Description("Returns the updated instance of the security question"))
  async updateSecurityQuestion(@PathParams("id") id: string, @BodyParams() @Groups("update") data: SecurityQuestion): Promise<Partial<SecurityQuestion>> {
    try {
      const securityQuestion = await this.securityQuestionService.updateSecurityQuestion(id, data);
      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/security-question/:id")
  @Summary("Deletes a security question by id")
  @(Returns(200, SecurityQuestion).Description("An account has been deleted successfully"))
  async deleteSecurityQuestion(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const securityQuestion = await this.securityQuestionService.deleteSecurityQuestion(id);
      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }
}
