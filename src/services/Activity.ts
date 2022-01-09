import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {Activity} from "../entities/Activity";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, InsertResult} from "typeorm";

@Service()
export class ActivityService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllActivities(): Promise<Activity[]> {
    try {
      const activities = await this.entityManager.find(Activity);
      return activities;
    } catch (e) {
      throw e;
    }
  }

  async createActivity(data: Activity): Promise<InsertResult> {
    try {
      const activity = await this.entityManager.insert(Activity, data);
      return activity;
    } catch (e) {
      throw e;
    }
  }

  async getActivityByName(name: string): Promise<Activity | undefined> {
    try {
      const activity = await this.entityManager.findOne(Activity, name);
      return activity;
    } catch (e) {
      throw e;
    }
  }

  async updateActivity(id: string, data: Activity): Promise<Partial<Activity>> {
    try {
      const activity = await this.entityManager
        .createQueryBuilder()
        .update(Activity, {
          activityType: data.activityType
        })
        .whereEntity({id: id} as Activity)
        .returning(["id"])
        .execute();
      return activity.generatedMaps[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteActivity(id: string): Promise<DeleteResult> {
    try {
      const activity = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(Activity)
        .where({id: id} as Activity)
        .execute();

      return activity;
    } catch (e) {
      throw e;
    }
  }
}
