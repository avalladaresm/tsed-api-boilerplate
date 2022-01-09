import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {SecurityQuestion} from "../entities/SecurityQuestion";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, InsertResult} from "typeorm";

@Service()
export class SecurityQuestionService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllSecurityQuestions(): Promise<SecurityQuestion[]> {
    try {
      const securityQuestions = await this.entityManager.find(SecurityQuestion);
      return securityQuestions;
    } catch (e) {
      throw e;
    }
  }

  async createSecurityQuestion(data: SecurityQuestion): Promise<InsertResult> {
    try {
      const securityQuestion = await this.entityManager.insert(SecurityQuestion, data);
      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }

  async updateSecurityQuestion(id: string, data: SecurityQuestion): Promise<Partial<SecurityQuestion>> {
    try {
      const securityQuestion = await this.entityManager
        .createQueryBuilder()
        .update(SecurityQuestion, {
          securityQuestion: data.securityQuestion
        })
        .whereEntity({id: id} as SecurityQuestion)
        .returning(["id"])
        .execute();
      return securityQuestion.generatedMaps[0];
    } catch (e) {
      throw e;
    }
  }

  async deleteSecurityQuestion(id: string): Promise<DeleteResult> {
    try {
      const securityQuestion = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(SecurityQuestion)
        .where({id: id} as SecurityQuestion)
        .execute();

      return securityQuestion;
    } catch (e) {
      throw e;
    }
  }
}
