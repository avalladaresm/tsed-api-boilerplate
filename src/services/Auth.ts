import { PlatformResponse, Service } from "@tsed/common";
import { BadRequest, Exception, NotFound } from "@tsed/exceptions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hotp } from 'otplib';
import { AccountActivity } from "../entities/AccountActivity";
import { PlatformModel } from "../models/Platform";
import { ConnectionManager, getConnectionManager, getManager, getRepository } from "typeorm";
import { Account } from "../entities/Account";
import { AccountRole } from "../entities/AccountRole";
import { ForgottenPasswordOtpHash } from "../entities/ForgottenPasswordOtpHash";
import { PendingAccountVerification } from "../entities/PendingAccountVerification";
import { EntryNotFound } from "../exceptions/EntryNotFound";
import { ForgotPasswordModel, ResendVerificationEmailModel, SignedAuthenticationJWTData, SignInModel, SignInResult, UpdatePasswordModel, VerifyOtpModel, VerifyPasswordModel } from "../models/Auth";
import { sendEmail } from "../utils/Mailer";
import { AccountService } from "./Account";
import { ErrorResponse } from "src/models/ErrorResponse";
import { returnSuccessResponse, throwErrorResponse } from "src/utils";
import { SuccessResponse } from "src/models/SuccessResponse";
import { CreatedAccountResponse } from "src/models/Account";


@Service()
export class AuthService {
  private connection: ConnectionManager;
  constructor(
    private accountService: AccountService,
  ) {}
  private accountRepository = getRepository(Account);
  private pendingAccountVerificationRepository = getRepository(PendingAccountVerification);

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

  async signin(data: SignInModel, platform: PlatformModel): Promise<SuccessResponse<SignInResult>> {
    try {
      const { email, password } = data;
      const loginRes = await getManager().transaction(async (transactionalEntityManager) => {
        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
        .where("account.email = :email")
        .setParameter("email", email)
        .getOne();

        if (!account) {
          return throwErrorResponse({
            code: "e-auth-0001",
            message: "Cuenta no encontrada",
            status: 404,
            value: null,
            exceptionType: "EntryNotFound"
          })
        }
        if (!bcrypt.compareSync(password, account.password)) {
          return throwErrorResponse({
            code: "e-auth-0002",
            message: "Usuario o clave incorrecta.",
            status: 400,
            value: null,
            exceptionType: "MalformedGuid"
          })
        }
        if (!account?.isActive) {
          return throwErrorResponse({
            code: "e-auth-0003",
            message: "Esta cuenta no está activa.",
            status: 401,
            value: null,
            exceptionType: "MalformedGuid"
          })
        }
        if (!account?.isVerified) {
          return throwErrorResponse({
            code: "e-auth-0004",
            message: "Esta cuenta no ha sido verificada.",
            status: 401,
            value: null,
            exceptionType: "MalformedGuid"
          })
        }
        
        const accountRolesResult = await transactionalEntityManager.createQueryBuilder(AccountRole, "accountRole")
          .where("accountRole.accountId = :accountId")
          .select(["accountRole.roleName"])
          .setParameter("accountId", account.id)
          .getMany();
        if (!accountRolesResult) {
          return throwErrorResponse({
            code: "e-auth-0005",
            message: "No se encontraron roles para esta cuenta.",
            status: 404,
            value: null,
            exceptionType: "MalformedGuid"
          })
        }
        const accountRoles = accountRolesResult.map(ar => ar.roleName)
        const signedData = { accountId: account.id, role: accountRoles, email: data.email };

        if (!process.env.JWT_SECRET) {
          return throwErrorResponse({
            code: "e-auth-0006",
            message: "No se pudo determinar las credenciales.",
            status: 400,
            value: null,
            exceptionType: "MalformedGuid"
          })
        }
        const token = jwt.sign({ signedData }, process.env.JWT_SECRET, {
          expiresIn: Number(process.env.JWT_EXPIRESIN_LOGIN),
          algorithm: "HS512"
        });

        await transactionalEntityManager.insert(AccountActivity, { 
          activityType: "sign_in",
          accountId: account.id,
          username: account.username,
          ip: platform.ip,
          browserName: platform.userAgent.browser.name,
          browserVersion: platform.userAgent.browser.version,
          osPlatform: platform.userAgent.os.name + " " + platform.userAgent.os.version,
        });

        return returnSuccessResponse({
          code: "s-auth-0001",
          message: "Login successful!",
          status: 200,
          value: {
            at: token, r: accountRoles, uid: account.id
          }
        })
      })
      return loginRes
    } catch (e) {
      throw e;
    }
  }

  async signup(data: Account, response: PlatformResponse): Promise<ErrorResponse<CreatedAccountResponse> | SuccessResponse<CreatedAccountResponse>> {
    try {              
      const createdAccount = await this.accountService.createAccount(data, response);
      if (!createdAccount) {
        throwErrorResponse({
          code: "e-auth-0001",
          message: "No se pudo crear la cuenta.",
          status: 400,
          value: null,
          exceptionType: "MalformedGuid"
        })
      }
      return createdAccount;
    }
    catch (e) {
      throw e
    }
  }

  async verify(accountId: string, accessToken: string, res: PlatformResponse): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const verificationResult = await getManager().transaction(async (transactionalEntityManager) => {
        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .where("account.id = :id")
          .setParameter("id", accountId)
          .getOne();
        if(!account) {
          error = new EntryNotFound('Esta cuenta no existe!')
          error.errors = [{ code: 'E0013', message: 'Esta cuenta no existe!' }]
          throw (error)
        }
        if(account.isVerified){
          const alreadyVerifiedView = await res.render('alreadyVerified');
          return alreadyVerifiedView
        } else {

          const pendingAccountVerification = await transactionalEntityManager.createQueryBuilder(PendingAccountVerification, "pendingAccountVerification")
          .where("pendingAccountVerification.accountId = :accountId")
          .setParameter("accountId", account.id)
          .getOne();

          if (!pendingAccountVerification) {
            const verificationExpired = await res.render('verificationExpired');
            return verificationExpired
          }

          const dateNow = new Date().getTime().valueOf()
          const expiresAt = new Date(pendingAccountVerification.exp).getTime().valueOf()
          if (dateNow > expiresAt) {
            const verificationExpired = await res.render('verificationExpired');
            return verificationExpired
          }
          if (!process.env.JWT_SECRET) {
            error = new BadRequest('No se pudo determinar las credenciale!')
            error.errors = [{ code: 'E0013', message: 'No se pudo determinar las credenciale!' }]
            throw (error)
          }
          const decoded: SignedAuthenticationJWTData = jwt.verify(accessToken, process.env.JWT_SECRET) as SignedAuthenticationJWTData
          if (accountId === decoded.signedData.accountId && accessToken === pendingAccountVerification.accessToken) {
            const updateAccountIsVerifiedResult = await transactionalEntityManager.createQueryBuilder(Account, "account")
              .update({isVerified: true})
              .where("account.id = :id")
              .setParameter("id", accountId)
              .execute();
            const deletePendingAccountVerificationResult = await transactionalEntityManager.createQueryBuilder(PendingAccountVerification, "pendingAccountVerification")
              .delete()
              .where("pendingAccountVerification.accountId = :id")
              .setParameter("id", accountId)
              .execute();
            const verificationSuccessful = await res.render('verificationSuccessful');
            return verificationSuccessful
          }
          else {
            const verificationExpired = await res.render('verificationExpired');
            return verificationExpired
          }
        }
      })
      return verificationResult
    }
    catch (e) {
      throw e
    }
  }

  async forgotPassword(forgotPasswordModel: ForgotPasswordModel, res: PlatformResponse): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const { email } = forgotPasswordModel
      const transactionResult = await getManager().transaction(async (transactionalEntityManager) => {

        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .where("account.email = :email", { email: email })
          .getOne();
          if (!account) {
            error = new NotFound('Cuenta no encontrada')
            error.errors = [{ code: 'E0001' }]
            throw (error)
          }

        if (!process.env.JWT_SECRET_OTP) {
          error = new BadRequest('No se pudo determinar las credenciales!')
          error.errors = [{ code: 'E0013', message: 'No se pudo determinar las credenciales!' }]
          throw (error)
        }
        const token = jwt.sign({ email }, process.env.JWT_SECRET_OTP, {
          expiresIn: Number(process.env.JWT_EXPIRESIN_OTP),
        });
        if (!token) {
          error = new BadRequest('No se pudo encriptar los datos de registro!')
          error.errors = [{ code: 'E0014', message: 'No se pudo encriptar los datos de registro!' }]
          throw (error)
        }
        const decodedToken: jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET_OTP) as jwt.JwtPayload;
        if (!decodedToken || !decodedToken.exp) {
          error = new BadRequest('No se pudo determinar los datos de la cuenta!')
          error.errors = [{ code: 'E0015', message: 'No se pudo determinar los datos de la cuenta!' }]
          throw (error)
        }

        const otp = hotp.generate(token, 12);
        
        const expDate = new Date(decodedToken.exp * 1000);
        await transactionalEntityManager.delete(ForgottenPasswordOtpHash, { email: email });
        await transactionalEntityManager.insert(ForgottenPasswordOtpHash, { email: email, otpHash: token, exp: expDate });
        const emailHtml = await res.render('otp', {
          name: account.name.split(' ')[0], 
          otp: otp
        });
        if (!emailHtml)
        throw new NotFound('HBS error')
        
        await sendEmail({ to: email, subject: 'Pin de recuperación', html: emailHtml })
        return true;
      });
      return transactionResult;
    } catch (e) {
      throw e
    }
  }

  async verifyOtp(verifyOtpModel: VerifyOtpModel): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const { email, otp } = verifyOtpModel
      const transactionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const otpHash = await transactionalEntityManager.createQueryBuilder(ForgottenPasswordOtpHash, "forgottenPasswordOtpHash")
          .where("forgottenPasswordOtpHash.email = :email", { email: email })
          .getOne();
          if (!otpHash) {
            error = new NotFound('Este código ya no es válido.')
            error.errors = [{ code: 'E0001' }]
            throw (error)
          }
          if (!process.env.JWT_SECRET_OTP) {
            error = new BadRequest('No se pudo determinar las credenciales!')
            error.errors = [{ code: 'E0013', message: 'No se pudo determinar las credenciales!' }]
            throw (error)
          }
          const decodedToken: jwt.JwtPayload = jwt.verify(otpHash.otpHash, process.env.JWT_SECRET_OTP) as jwt.JwtPayload;
          if (!decodedToken || !decodedToken.exp) {
            error = new BadRequest('No se pudo determinar los datos de la cuenta!')
            error.errors = [{ code: 'E0015', message: 'No se pudo determinar los datos de la cuenta!' }]
            throw (error)
          }
          const isValid = hotp.check(otp, otpHash.otpHash, 12);
          return isValid
        })
      return transactionResult
    } catch (e) {
      throw e
    }
  }

  async resendVerificationEmail(resendVerificationEmailModel: ResendVerificationEmailModel, res: PlatformResponse): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const { email } = resendVerificationEmailModel
      const transactionResult = await getManager().transaction(async (transactionalEntityManager) => {
        const account = await transactionalEntityManager.createQueryBuilder(Account, "account")
          .where("account.email = :email", { email: email })
          .getOne();
          if (!account) {
            error = new NotFound('Cuenta no encontrada')
            error.errors = [{ code: 'E0001' }]
            throw (error)
          }
          const signedData = { accountId: account.id, role: account.accountRoles, email: email };

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
          const emailHtml = await res.render('verifyAccount', {
            name: account.name?.split(' ')[0], link: `${process.env.API_BASE_URL}/auth/verify?id=${account.id}&accessToken=${token}`
          });
          if (!emailHtml)
            throw new NotFound('HBS error')
    
          await sendEmail({ to: resendVerificationEmailModel.email, subject: 'Verifica tu cuenta', html: emailHtml })
          return true
      })
      return transactionResult;
    } catch (e) {
      throw e
    }
  }

  async updatePassword(data: UpdatePasswordModel): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const { email, newPassword: password } = data;
      const newPassword = bcrypt.hashSync(password, 10)
      if (!newPassword) {
        error = new BadRequest('No se pudo encriptar los datos de registro!')
        error.errors = [{ code: 'E0014', message: 'No se pudo encriptar los datos de registro!' }]
        throw (error)
      }
      const updatePassword = await this.accountRepository
        .createQueryBuilder("account")
        .update(Account)
        .set({ password: newPassword })
        .where("account.email = :email")
        .setParameter("email", email)
        .execute();
      
      return updatePassword.affected === 1;
    } catch (e) {
      throw e
    }
  }
}