import {BodyParams, Controller, Delete, Get, PathParams, Post, Put} from "@tsed/common";
import {Groups, Returns, Status, Summary} from "@tsed/schema";
import {Activity} from "../entities/Activity";
import {CustomError} from "../models/CustomError";
import {ActivityService} from "../services/Activity";
import {DeleteResult, InsertResult} from "typeorm";

@Controller("/")
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get("/activities")
  @Summary("Gets all activities")
  @(Returns(200, Activity).Groups("read").Description("Returns an array of activities"))
  async getAllActivities(): Promise<Activity[]> {
    try {
      const activities = await this.activityService.getAllActivities();
      return activities;
    } catch (e) {
      throw e;
    }
  }

  @Post("/activity")
  @Summary("Creates a activity")
  @(Returns(201, Activity).Groups("read").Description("Returns the instance of the created activity"))
  @(Status(400, CustomError).Description("Validation error or data is malformed"))
  async createActivity(@BodyParams() @Groups("create") data: Activity): Promise<InsertResult> {
    try {
      const activity = await this.activityService.createActivity(data);
      return activity;
    } catch (e) {
      throw e;
    }
  }

  @Put("/activity/:id")
  @Summary("Updates a activity by id")
  @(Returns(200, Activity).Groups("read").Description("Returns the updated instance of the activity"))
  async updateActivity(@PathParams("id") id: string, @BodyParams() @Groups("update") data: Activity): Promise<Partial<Activity>> {
    try {
      const activity = await this.activityService.updateActivity(id, data);
      return activity;
    } catch (e) {
      throw e;
    }
  }

  @Delete("/activity/:id")
  @Summary("Deletes a activity by id")
  @(Returns(200, Activity).Description("An account has been deleted successfully"))
  async deleteActivity(@PathParams("id") id: string): Promise<DeleteResult> {
    try {
      const activity = await this.activityService.deleteActivity(id);
      return activity;
    } catch (e) {
      throw e;
    }
  }
}
