import { PlatformContext, PlatformResponse, Service} from "@tsed/common";
import {InjectContext} from "@tsed/async-hook-context";
import { Exception, NotFound } from "@tsed/exceptions";
import {MSSQL_DUP_ENTRY_ERROR_NUMBER, MSSQL_MALFORMED_GUID_ERROR_NUMBER} from "../constants/mssql_errors";
import {Account} from "../entities/Account";
import {AccountRole} from "../entities/AccountRole";
import {DuplicateEntry} from "../exceptions/DuplicateEntry";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, getRepository} from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PendingAccountVerification } from "../entities/PendingAccountVerification";
import { MalformedGuid } from "../exceptions/MalformedGuid";
import { sendEmail } from "../utils/Mailer";
import { AccountSecurityQuestion } from "../entities/AccountSecurityQuestion";
import { AccountActivity } from "src/entities/AccountActivity";
import { PlatformModel } from "src/models/Platform";
import parser from "ua-parser-js";
import { getRequesterAccountUID, isObjectOrArrayEmpty, isValueNullUndefinedOrEmpty, returnSuccessResponse, throwErrorResponse } from "src/utils";
import { ErrorResponse } from "src/models/ErrorResponse";
import { CreatedAccountResponse } from "src/models/Account";
import { SuccessResponse } from "src/models/SuccessResponse";

@Service()
export class AccountService {
  @InjectContext()
  $ctx?: PlatformContext;

  private connection: ConnectionManager;
  private entityManager = getManager();
  private accountRoleRepository = getRepository(AccountRole);

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async getAllAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.entityManager.find(Account, {
        relations: ["accountRoles"]
      });
      return accounts;
    } catch (e) {
      throw e;
    }
  }

  async createAccount(data: Account, response: PlatformResponse): Promise<ErrorResponse<CreatedAccountResponse> | SuccessResponse<CreatedAccountResponse>> {
    try {
      const createdAccount = await getManager().transaction(async (transactionalEntityManager) => {
        const accountByEmail = await this.getAccountByEmail(data.email);
        if (accountByEmail) {
          throwErrorResponse({
            code: "e-account-0001",
            message: "Este correo ya se encuentra en uso.",
            status: 409,
            value: null,
            exceptionType: "DuplicateEntry"
          })
        }
        
        const accountByPhoneNumber = await this._getAccountByPhoneNumber(data.phoneNumber);
        if (accountByPhoneNumber) {
          throwErrorResponse({
            code: "e-account-0002",
            message: "Este número de teléfono ya se encuentra en uso.",
            status: 409,
            value: null,
            exceptionType: "DuplicateEntry"
          })
        }
        
        const accountByUsername = await this._getAccountByUsername(data.username);
        if (accountByUsername) {
          throwErrorResponse({
            code: "e-account-0002",
            message: "Este nombre de usuario ya se encuentra en uso.",
            status: 409,
            value: null,
            exceptionType: "DuplicateEntry"
          })
        }

        data.password = bcrypt.hashSync(data.password, 10)
        if (!data.password) {
          return throwErrorResponse({
            code: "e-account-0003",
            message: "Ocurrio un error al almacenar la clave, por favor intente de nuevo.",
            status: 400,
            value: null
          })
        }

        const insertedAccount = await transactionalEntityManager.save(Account, data);
        if (!insertedAccount) {
          return throwErrorResponse({
            code: "e-account-0004",
            message: "No se pudo crear la cuenta.",
            status: 400,
            value: null,
          })
        }

        const roles = ["admin", "clientadmin"];
        const accountRoles: AccountRole[] = [];
        for (const role of roles) {
          const _accountRole = await transactionalEntityManager.save(AccountRole, {
            roleName: role,
            accountId: insertedAccount.id
          });
          accountRoles.push(_accountRole);
        }
        insertedAccount.accountRoles = accountRoles;
        const signedData = { accountId: insertedAccount.id, role: insertedAccount.accountRoles, email: data.email };

        if (!process.env.JWT_SECRET) {
          return throwErrorResponse({
            code: "e-account-0005",
            message: "No se pudo determinar las credenciales.",
            status: 400,
            value: null,
            exceptionType: "EnvVarException"
          })
        }

        const token = jwt.sign({ signedData }, process.env.JWT_SECRET, {
          expiresIn: Number(process.env.JWT_EXPIRESIN_SIGNUP),
          algorithm: "HS512"
        });

        if (!token) {
          return throwErrorResponse({
            code: "e-account-0006",
            message: "No se pudo encriptar los datos de registro.",
            status: 400,
            value: null
          })
        }

        const decodedToken: jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        if (!decodedToken || !decodedToken.exp) {
          return throwErrorResponse({
            code: "e-account-0007",
            message: "No se pudo determinar los datos de la cuenta.",
            status: 400,
            value: null
          })
        }

        const expDate = new Date(decodedToken.exp * 1000);
        await transactionalEntityManager.delete(PendingAccountVerification, { accountId: insertedAccount.id });
        await transactionalEntityManager.insert(PendingAccountVerification, { accountId: insertedAccount.id, accessToken: token, exp: expDate });

        const response: CreatedAccountResponse = {account: insertedAccount, accessToken: token}
        return returnSuccessResponse({
          code: "s-account-0001",
          message: "Se ha creado la cuenta exitosamente.",
          status: 200,
          value: response
        });
      });

      if (createdAccount.apiResult.responseResult === "success") {
        const emailHtml = await response.render('verifyAccount', {
          name: data.name, link: `${process.env.API_BASE_URL}/auth/verify?id=${createdAccount.apiResult.value.account.id}&accessToken=${createdAccount.apiResult.value.accessToken}`
        });
        if (!emailHtml) {
          throw new NotFound('HBS error')
        }
        await sendEmail({ to: data.email, subject: 'Verifica tu cuenta', html: emailHtml })
      }
      return createdAccount
    } catch (e) {
      throw e;
    }
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    try {
      let error: Exception = {} as Exception;
      // const { signedData: { accountId } } = this.$ctx?.request.req.app.locals.signedData as SignedAuthenticationJWTData
      // const accountId = 1
      const platform: PlatformModel = {userAgent: parser(this.$ctx?.request.headers["user-agent"]), ip: this.$ctx?.request.headers["x-real-ip"]?.toString() ?? ""}
      console.log('dfsdf', this.$ctx?.request.headers["user-agent"])
      const getAccountResult = await getManager().transaction(async (transactionalEntityManager) => {

        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .innerJoinAndSelect("account.accountRoles", "accountRole")
          .where("account.id = :accountId")
          .setParameter("accountId", id)
          .getOne();
        if (!account) {
          error = new NotFound('Cuenta origen no encontrada')
          error.errors = [{ code: 'E0001' }]
          throw (error)
        }
        const targetAccount = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .innerJoinAndSelect("account.accountRoles", "accountRole")
          .where("account.id = :id")
          .setParameter("id", id)
          .getOne();
        if (!targetAccount) {
          error = new NotFound('Cuenta objetivo no encontrada')
          error.errors = [{ code: 'E0001' }]
          throw (error)
        }

        await transactionalEntityManager.insert(AccountActivity, { 
          activityType: "account_view_target_account",
          accountId: account.id,
          username: account.username,
          targetUsername: targetAccount.username,
          ip: platform.ip,
          browserName: platform.userAgent.browser.name,
          browserVersion: platform.userAgent.browser.version,
          osPlatform: platform.userAgent.os.name + " " + platform.userAgent.os.version,
        });

        return targetAccount
      })
      return getAccountResult;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      else if (e?.number === MSSQL_MALFORMED_GUID_ERROR_NUMBER) {
        throw new MalformedGuid(e?.message);
      }
      throw e;
    }
  }

  async getAccountRoles(accountId: string): Promise<string[] | undefined> {
    try {
      const accountRolesResult = await this.accountRoleRepository.createQueryBuilder("accountRole")
        .where("accountRole.accountId = :accountId")
        .select(["accountRole.roleName"])
        .setParameter("accountId", accountId)
        .getMany();
      const accountRoles = accountRolesResult.map(ar => ar.roleName)
      return accountRoles;
    } catch (e) {
      throw e;
    }
  }

  async getAccountSecurityQuestion(accountId: string): Promise<ErrorResponse<any> | SuccessResponse<any>> {
    try {
      const accountSecurityQuestionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const accountSecurityQuestion = await transactionalEntityManager.createQueryBuilder(AccountSecurityQuestion, "accountSecurityQuestion")
          .innerJoinAndSelect("accountSecurityQuestion.securityQuestion", "securityQuestion")
          .where("accountSecurityQuestion.accountId = :accountId")
          .setParameter("accountId", accountId)
          .getOne();

        if (!accountSecurityQuestion) {
          return returnSuccessResponse({
            code: "e-account-0008",
            message: "No se ha configurado una pregunta de seguridad.",
            status: 200,
            value: null,
            responseResult: "error"
          })
        }

        return returnSuccessResponse({
          code: "s-account-0001",
          message: "",
          status: 200,
          value: {
            ...accountSecurityQuestion.securityQuestion,
            securityQuestionId: accountSecurityQuestion.securityQuestion.id,
            id: accountSecurityQuestion.id
          }
        });
      });
        
      return accountSecurityQuestionResult;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      else if (e?.number === MSSQL_MALFORMED_GUID_ERROR_NUMBER) {
        throw new MalformedGuid(e?.message);
      }
      throw e;
    }
  }

  async getAccountActivities(accountId: string): Promise<AccountActivity[] | undefined> {
    try {
      let error: Exception = {} as Exception;
      const getAccountActivitiesResult = await getManager().transaction(async (transactionalEntityManager) => {
        const accountActivities = await transactionalEntityManager.createQueryBuilder(AccountActivity, "accountActivity")
          .where("accountActivity.accountId = :accountId")
          .setParameter("accountId", accountId)
          .getMany();
        if (!accountActivities) {
          error = new NotFound('Cuenta origen no encontrada')
          error.errors = [{ code: 'E0001' }]
          throw (error)
        }
        return accountActivities
      })
      return getAccountActivitiesResult;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      else if (e?.number === MSSQL_MALFORMED_GUID_ERROR_NUMBER) {
        throw new MalformedGuid(e?.message);
      }
      throw e;
    }
  }

  async verifyAccountPassword(password: string): Promise<ErrorResponse<boolean> | SuccessResponse<boolean>> {
    try {
      const requesterAccountUID = getRequesterAccountUID(this.$ctx?.request.headers.authorization?.split(' ')[1])
      const transactionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .select("account.password")
          .where("account.id = :id", { id: requesterAccountUID })
          .getOne();
          if (!account) {
            return throwErrorResponse({
              code: "e-auth-0002",
              message: "Cuenta no encontrada.",
              status: 400,
              value: null,
              exceptionType: "MalformedGuid"
            })
          }
          if (!bcrypt.compareSync(password, account.password)) {
            return returnSuccessResponse({
              code: "s-auth-0001",
              message: "Contraseña no coincide!",
              status: 200,
              value: false
            })
          }
          return returnSuccessResponse({
            code: "s-auth-0001",
            message: "Contraseña verificada exitosamente!",
            status: 200,
            value: true
          })
        })
      return transactionResult
    } catch (e) {
      throw e
    }
  }

  async updateAccountProfile(data: Partial<Account>):  Promise<ErrorResponse<Account | null> | SuccessResponse<Account | null>> {
    try {
      if (isObjectOrArrayEmpty(data)) {
        return returnSuccessResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "Los datos de la cuenta no deberían estar vacíos",
          status: 200,
          value: null,
          responseResult: "error",
        })
      }
      const requesterAccountUID = getRequesterAccountUID(this.$ctx?.request.headers.authorization?.split(' ')[1])
      if (isValueNullUndefinedOrEmpty(requesterAccountUID)) {
        return returnSuccessResponse({
          code: "e-account-security-question-0001",
          canNotify: true,
          message: "No se determinar el usuario de origen",
          status: 200,
          value: null,
          responseResult: "error"
        })
      }
      const updateAccountResult = await getManager().transaction(async (transactionalEntityManager) => {
        const existingAccountRow = await transactionalEntityManager.preload(Account, { id: requesterAccountUID }) ?? {};
        Reflect.deleteProperty(existingAccountRow, "password")
        const updateAccountResult = await transactionalEntityManager.save(Account, {
          id: requesterAccountUID,
          ...existingAccountRow,
          ...data,
        });

        if (!updateAccountResult) {
          return throwErrorResponse({
            code: "e-account-security-question-0002",
            canNotify: true,
            message: "No se han podido actualizar los datos de la cuenta.",
            status: 200,
            value: null,
            exceptionType: "EntryNotFound"
          })
        }

        return returnSuccessResponse({
          code: "s-account-security-question-0001",
          canNotify: true,
          message: "Los datos de la cuenta se han actualizado exitosamente.",
          status: 200,
          value: updateAccountResult
        });
      })

      return updateAccountResult
    } catch (e) {
      throw e;
    }
  }

  async updateAccount(id: string, data: Partial<Account>):  Promise<ErrorResponse<Account | null> | SuccessResponse<Account | null>> {
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

      const updateAccountResult = await getManager().transaction(async (transactionalEntityManager) => {
        const existingAccountRow = await transactionalEntityManager.preload(Account, { id: id }) ?? {};
        Reflect.deleteProperty(existingAccountRow, "password")
        const updateAccountResult = await transactionalEntityManager.save(Account, {
          id: id,
          ...existingAccountRow,
          ...data,
        });

        if (!updateAccountResult) {
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

      return updateAccountResult
    } catch (e) {
      throw e;
    }
  }

  async deleteAccount(id: string): Promise<DeleteResult> {
    try {
      const account = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(Account)
        .where({id: id} as Account)
        .execute();

      return account;
    } catch (e) {
      throw e;
    }
  }

  async getAccountByEmail(email: string): Promise<Account | undefined> {
    try {
      const account = await this.entityManager.findOne(Account, email);
      return account;
    } catch (e) {
      throw e;
    }
  }

  async _getAccountByPhoneNumber(phoneNumber: string): Promise<Account | undefined> {
    try {
      const account = await this.entityManager.findOne(Account, phoneNumber);
      return account;
    } catch (e) {
      throw e;
    }
  }

  async _getAccountByUsername(username: string): Promise<Account | undefined> {
    try {
      const account = await this.entityManager.findOne(Account, username);
      return account;
    } catch (e) {
      throw e;
    }
  }
}
