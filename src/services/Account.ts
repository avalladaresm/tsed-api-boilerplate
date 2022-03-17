import {Inject, Injectable, PlatformApplication, PlatformContext, PlatformRequest, PlatformResponse, Service} from "@tsed/common";
import {InjectContext} from "@tsed/async-hook-context";
import { BadRequest, Conflict, Exception, NotFound } from "@tsed/exceptions";
import {TypeORMService} from "@tsed/typeorm";
import {MSSQL_DUP_ENTRY_ERROR_NUMBER, MSSQL_MALFORMED_GUID_ERROR_NUMBER} from "../constants/mssql_errors";
import {Account} from "../entities/Account";
import {AccountRole} from "../entities/AccountRole";
import {DuplicateEntry} from "../exceptions/DuplicateEntry";
import {EntryNotFound} from "../exceptions/EntryNotFound";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, getRepository} from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PendingAccountVerificationService } from "./PendingAccountVerification";
import { PendingAccountVerification } from "../entities/PendingAccountVerification";
import { SignedAuthenticationJWTData, SignUpResponse } from "../models/Auth";
import { MalformedGuid } from "../exceptions/MalformedGuid";
import { sendEmail } from "../utils/Mailer";
import { AccountSecurityQuestion } from "../entities/AccountSecurityQuestion";
import { AccountActivity } from "src/entities/AccountActivity";
import { PlatformModel } from "src/models/Platform";
import parser from "ua-parser-js";

@Service()
export class AccountService {
  @InjectContext()
  $ctx?: PlatformContext;

  private connection: ConnectionManager;
  constructor(
    private typeORMService: TypeORMService,
    private pendingAccountVerificationService: PendingAccountVerificationService,
  ) {}
  private entityManager = getManager();
  private accountRepository = getRepository(Account);
  private accountRoleRepository = getRepository(AccountRole);
  private accountSecurityQuestionRepository = getRepository(AccountSecurityQuestion);

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

  async createAccount(data: Account, response: PlatformResponse): Promise<SignUpResponse | undefined> {
    try {
      let error: Exception = {} as Exception;
      const createdAccount = await getManager().transaction(async (transactionalEntityManager) => {
        const accountByEmail = await this.getAccountByEmail(data.email);
        if (accountByEmail) {
          error = new Conflict('Este correo ya se encuentra en uso')
          error.errors = [{ code: 'E0008' }]
          throw (error)
        }
        
        const accountByPhoneNumber = await this.getAccountByPhoneNumber(data.phoneNumber);
        if (accountByPhoneNumber) {
          error = new Conflict('Este número de teléfono ya se encuentra en uso')
          error.errors = [{ code: 'E0009' }]
          throw (error)
        }

        data.password = bcrypt.hashSync(data.password, 10)
        if (!data.password) {
          error = new BadRequest('Ocurrio un error al almacenar la clave, por favor intente de nuevo')
          error.errors = [{ code: 'E0010' }]
          throw (error)
        }

      /* data.securityQuestionAnswer = bcrypt.hashSync(data.securityQuestionAnswer.toLowerCase(), 10)
        if (!data.securityQuestionAnswer) {
          error = new BadRequest('Ocurrio un error al encriptar la pregunta de seguridad, por favor intente de nuevo')
          error.errors = [{ code: 'E0011' }]
          throw (error)
        } */

        const insertAccount = await transactionalEntityManager.insert(Account, data);
        if (!insertAccount) {
          error = new BadRequest('No se pudo crear la cuenta!')
          error.errors = [{ code: 'E0013', message: 'No se pudo crear la cuenta!' }]
          throw (error)
        }
        const { generatedMaps: [account] } = insertAccount
        const roles = ["admin", "clientadmin"];
        const accountRoles: AccountRole[] = [];
        for (const role of roles) {
          const _accountRole = await transactionalEntityManager.insert(AccountRole, {
            roleName: role,
            accountId: account.id
          });
          accountRoles.push(_accountRole.identifiers[0].roleName);
        }
        account.accountRoles = accountRoles;
        const signedData = { accountId: account.id, role: account.accountRoles, email: data.email };

        if (!process.env.JWT_SECRET) {
          error = new BadRequest('No se pudo determinar las credenciales!')
          error.errors = [{ code: 'E0013', message: 'No se pudo determinar las credenciales!' }]
          throw (error)
        }

        const token = jwt.sign({ signedData }, process.env.JWT_SECRET, {
          expiresIn: Number(process.env.JWT_EXPIRESIN_SIGNUP),
          algorithm: "HS512"
        });
        if (!token) {
          error = new BadRequest('No se pudo encriptar los datos de registro!')
          error.errors = [{ code: 'E0014', message: 'No se pudo encriptar los datos de registro!' }]
          throw (error)
        }

        const decodedToken: jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        if (!decodedToken || !decodedToken.exp) {
          error = new BadRequest('No se pudo determinar los datos de la cuenta!')
          error.errors = [{ code: 'E0015', message: 'No se pudo determinar los datos de la cuenta!' }]
          throw (error)
        }

        const expDate = new Date(decodedToken.exp * 1000);
        await transactionalEntityManager.delete(PendingAccountVerification, { accountId: account.id });
        await transactionalEntityManager.insert(PendingAccountVerification, { accountId: account.id, accessToken: token, exp: expDate });
        return { accountId: account.id, accessToken: token};
      });

      const _account = await this.getAccountById(createdAccount.accountId);
      const emailHtml = await response.render('verifyAccount', {
        name: data.name, link: `${process.env.API_BASE_URL}/auth/verify?id=${createdAccount.accountId}&accessToken=${createdAccount.accessToken}`
      });
      if (!emailHtml)
        throw new NotFound('HBS error')

      await sendEmail({ to: data.email, subject: 'Verifica tu cuenta', html: emailHtml })
      return { account: _account, accessToken: createdAccount.accessToken };
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      throw e;
    }
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    try {
      let error: Exception = {} as Exception;
      // const { signedData: { accountId } } = this.$ctx?.request.req.app.locals.signedData as SignedAuthenticationJWTData
      const accountId = 1
      const platform: PlatformModel = {userAgent: parser(this.$ctx?.request.headers["user-agent"]), ip: this.$ctx?.request.headers["x-real-ip"]?.toString() ?? ""}
      console.log('dfsdf', this.$ctx?.request.headers["user-agent"])
      const getAccountResult = await getManager().transaction(async (transactionalEntityManager) => {

        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .innerJoinAndSelect("account.accountRoles", "accountRole")
          .where("account.id = :accountId")
          .setParameter("accountId", accountId)
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
        throw new MalformedGuid();
      }
      throw e;
    }
  }

  async getAccountByEmail(email: string): Promise<Account | undefined> {
    try {
      const account = await this.accountRepository.createQueryBuilder("account")
        .where("account.email = :email", { email: email })
        .getOne();
      return account;
    } catch (e) {
      if (e?.name === "EntityNotFoundError") {
        throw new EntryNotFound(`Account with email: ${email} does not exist.`);
      }
      throw e;
    }
  }

  async getAccountByPhoneNumber(phoneNumber: string): Promise<Account | undefined> {
    try {
      const account = await this.accountRepository.createQueryBuilder("account")
        .where("account.phoneNumber = :phoneNumber", { phoneNumber: phoneNumber })
        .getOne();
      return account;
    } catch (e) {
      if (e?.name === "EntityNotFoundError") {
        throw new EntryNotFound(`Account with phone number: ${phoneNumber} does not exist.`);
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
      if (e?.name === "EntityNotFoundError") {
        throw new EntryNotFound(`Account with id: ${accountId} does not exist.`);
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
        throw new MalformedGuid();
      }
      throw e;
    }
  }

  async updateAccount(id: string, data: Account): Promise<Partial<Account>> {
    try {
      const account = await this.entityManager
        .createQueryBuilder()
        .update(Account, {
          name: data.name,
          phoneNumber: data.phoneNumber,
          dob: data.dob,
          country: data.country,
          state: data.state,
          city: data.city,
          gender: data.gender,
          identificationDocument: data.identificationDocument,
          identificationDocumentType: data.identificationDocumentType
        })
        .whereEntity({id: id} as Account)
        .returning(["id"])
        .execute();
      if (account.generatedMaps.length === 0) {
        const _account = await this.entityManager.findOne(Account, id);
        if (!_account) throw new EntryNotFound(`Update failed. Account with id: ${id} does not exist.`);
      }
      return account.generatedMaps[0];
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
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

  async getAccountSecurityQuestion(accountId: string): Promise<AccountSecurityQuestion | undefined> {
    try {
      const account = await this.accountSecurityQuestionRepository.createQueryBuilder("accountSecurityQuestion")
        .innerJoinAndSelect("accountSecurityQuestion.account", "account")
        .where("accountSecurityQuestion.accountId = :accountId")
        .setParameter("accountId", accountId)
        .getOne();
      return account;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      else if (e?.number === MSSQL_MALFORMED_GUID_ERROR_NUMBER) {
        throw new MalformedGuid();
      }
      throw e;
    }
  }
}
