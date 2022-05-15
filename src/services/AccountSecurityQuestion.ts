import {PlatformContext, Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {AccountSecurityQuestion} from "../entities/AccountSecurityQuestion";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager} from "typeorm";
import { getRequesterAccountUID, isValueNullUndefinedOrEmpty, isObjectOrArrayEmpty, returnSuccessResponse, throwErrorResponse } from "src/utils";
import bcrypt from "bcrypt";
import { ErrorResponse } from "src/models/ErrorResponse";
import { SuccessResponse } from "src/models/SuccessResponse";
import { InjectContext } from "@tsed/async-hook-context";

@Service()
export class AccountSecurityQuestionService {
  @InjectContext()
  $ctx?: PlatformContext;
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

  async createAccountSecurityQuestion(data: AccountSecurityQuestion): Promise<ErrorResponse<AccountSecurityQuestion | null> | SuccessResponse<AccountSecurityQuestion | null>> {
    try {
      if (isObjectOrArrayEmpty(data)) {
        return returnSuccessResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "Los datos de la nueva pregunta de seguridad no deberían estar vacíos",
          status: 200,
          value: null,
          responseResult: "error",
        })
      }
      const accountSecurityQuestionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const hashedSecurityQuestionAnswer = bcrypt.hashSync(data.securityQuestionAnswer.toLowerCase(), 10)
        if (!hashedSecurityQuestionAnswer) {
          return throwErrorResponse({
            code: "e-account-security-question-0001",
            canNotify: true,
            message: "No se ha podido encriptar la respuesta a la pregunta de seguridad de la cuenta.",
            status: 404,
            value: null,
            exceptionType: "EntryNotFound"
          })
        }
        console.log("dfdf", data)
        const insertedAccountSecurityQuestionResult = await transactionalEntityManager.save(AccountSecurityQuestion, {
          account: { id: data.accountId },
          securityQuestion: { id: data.securityQuestionId },
          securityQuestionAnswer: hashedSecurityQuestionAnswer
        });
        if (!insertedAccountSecurityQuestionResult) {
          return throwErrorResponse({
            code: "e-account-security-question-0002",
            canNotify: true,
            message: "No se ha podido guardar la pregunta de seguridad de la cuenta.",
            status: 404,
            value: null,
            exceptionType: "EntryNotFound"
          })
        }

        return returnSuccessResponse({
          code: "s-account-security-question-0001",
          canNotify: true,
          message: "La pregunta de seguridad se ha guardado exitosamente.",
          status: 200,
          value: insertedAccountSecurityQuestionResult
        });
      })
      return accountSecurityQuestionResult
    } catch (e) {
      throw e;
    }
  }

  async updateAccountSecurityQuestion(id: string, data: AccountSecurityQuestion): Promise<ErrorResponse | SuccessResponse> {
    try {
      if (isValueNullUndefinedOrEmpty(id)) {
        return returnSuccessResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "Los datos de la pregunta de seguridad existente no deberían estar vacíos",
          status: 200,
          value: null,
          responseResult: "error",
        })
      } else if (isObjectOrArrayEmpty(data)) {
        return returnSuccessResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "Los datos de la nueva pregunta de seguridad no deberían estar vacíos",
          status: 200,
          value: null,
          responseResult: "error",
        })
      }
      const requesterAccountUID = getRequesterAccountUID(this.$ctx?.request.headers.authorization?.split(' ')[1])
      const hashedSecurityQuestionAnswer = bcrypt.hashSync(data.securityQuestionAnswer.toLowerCase(), 10)
      if (!hashedSecurityQuestionAnswer) {
        return throwErrorResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "No se ha podido encriptar la respuesta a la pregunta de seguridad de la cuenta.",
          status: 404,
          value: null,
          exceptionType: "EntryNotFound"
        })
      }

      const updateAccountSecurityQuestionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const existingAccountSecurityQuestionRow = await transactionalEntityManager.preload(AccountSecurityQuestion, { id: id });
        const updateAccountSecurityQuestionResult = await transactionalEntityManager.save(AccountSecurityQuestion, {
          ...existingAccountSecurityQuestionRow,
          id: id,
          accountId: requesterAccountUID,
          securityQuestionId: data.securityQuestionId,
          securityQuestion: {
            id: data.securityQuestionId
          },
          securityQuestionAnswer: hashedSecurityQuestionAnswer
        });

        if (!updateAccountSecurityQuestionResult) {
          return throwErrorResponse({
            code: "e-account-security-question-0002",
            canNotify: true,
            message: "No se ha podido guardar la pregunta de seguridad de la cuenta.",
            status: 404,
            value: null,
            exceptionType: "EntryNotFound"
          })
        }

        return returnSuccessResponse({
          code: "s-account-security-question-0001",
          canNotify: true,
          message: "La pregunta de seguridad se ha guardado exitosamente.",
          status: 200,
          value: null
        });
      })

      return updateAccountSecurityQuestionResult
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
