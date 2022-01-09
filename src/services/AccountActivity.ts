import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {AccountActivity} from "../entities/AccountActivity";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, InsertResult} from "typeorm";

@Service()
export class AccountActivityService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllAccountActivities(): Promise<AccountActivity[]> {
    try {
      const accountActivities = await this.entityManager.find(AccountActivity);
      return accountActivities;
    } catch (e) {
      throw e;
    }
  }

  async createAccountActivity(data: AccountActivity): Promise<InsertResult> {
    try {
      const accountActivities = await this.entityManager.insert(AccountActivity, data);
      return accountActivities;
    } catch (e) {
      throw e;
    }
  }

  async updateAccountActivity(id: string, data: AccountActivity): Promise<Partial<AccountActivity>> {
    try {
      const accountActivity = await this.entityManager
        .createQueryBuilder()
        .update(AccountActivity, {
          activityType: data.activityType
        })
        .whereEntity({id: id} as AccountActivity)
        .returning(["id"])
        .execute();
      return accountActivity.generatedMaps[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteAccountActivity(id: string): Promise<DeleteResult> {
    try {
      const accountActivities = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(AccountActivity)
        .where({id: id} as AccountActivity)
        .execute();

      return accountActivities;
    } catch (e) {
      throw e;
    }
  }
}
