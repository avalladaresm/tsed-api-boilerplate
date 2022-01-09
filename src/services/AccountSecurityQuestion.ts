import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {AccountSecurityQuestion} from "../entities/AccountSecurityQuestion";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, InsertResult} from "typeorm";

@Service()
export class AccountSecurityQuestionService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllAccountSecurityQuestions(): Promise<AccountSecurityQuestion[]> {
    try {
      const accountSecurityQuestions = await this.entityManager.find(AccountSecurityQuestion);
      return accountSecurityQuestions;
    } catch (e) {
      throw e;
    }
  }

  async createAccountSecurityQuestion(data: AccountSecurityQuestion): Promise<InsertResult> {
    try {
      const accountSecurityQuestions = await this.entityManager.insert(AccountSecurityQuestion, data);
      return accountSecurityQuestions;
    } catch (e) {
      throw e;
    }
  }

  async updateAccountSecurityQuestion(id: string, data: AccountSecurityQuestion): Promise<Partial<AccountSecurityQuestion>> {
    try {
      const securityQuestion = await this.entityManager
        .createQueryBuilder()
        .update(AccountSecurityQuestion, {
          securityQuestion: data.securityQuestion
        })
        .whereEntity({id: id} as AccountSecurityQuestion)
        .returning(["id"])
        .execute();
      return securityQuestion.generatedMaps[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteAccountSecurityQuestion(id: string): Promise<DeleteResult> {
    try {
      const accountSecurityQuestions = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(AccountSecurityQuestion)
        .where({id: id} as AccountSecurityQuestion)
        .execute();

      return accountSecurityQuestions;
    } catch (e) {
      throw e;
    }
  }
}
