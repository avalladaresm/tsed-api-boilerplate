import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {SecurityQuestion} from "../entities/SecurityQuestion";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager} from "typeorm";
import { DuplicateEntry } from "../exceptions/DuplicateEntry";
import { MSSQL_DUP_ENTRY_ERROR_NUMBER } from "../constants/mssql_errors";
import { returnSuccessResponse, throwErrorResponse } from "src/utils";
import { ErrorResponse } from "src/models/ErrorResponse";
import { SuccessResponse } from "src/models/SuccessResponse";

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

  async createSecurityQuestion(data: SecurityQuestion): Promise<ErrorResponse<SecurityQuestion> | SuccessResponse<SecurityQuestion>> {
    try {
      const createdSecurityQuestion = await getManager().transaction(async (transactionalEntityManager) => {
        const insertedSecurityQuestion = await transactionalEntityManager.save(SecurityQuestion, data);
        if (!insertedSecurityQuestion) {
          return throwErrorResponse({
            code: "e-security-question-0001",
            message: "No se pudo crear la pregunta de seguridad.",
            status: 400,
            value: null,
          })
        }

        return returnSuccessResponse({
          code: "s-security-question-0001",
          canNotify: true,
          message: "Se ha creado la pregunta de seguridad exitosamente.",
          status: 200,
          value: insertedSecurityQuestion
        });
      });

      return createdSecurityQuestion;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
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
