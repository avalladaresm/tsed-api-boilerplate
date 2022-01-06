import { Account } from "src/entities/Account";
import { AccountRole } from "src/entities/AccountRole";
import { AccountService } from "./Account";
import { BadRequest, Exception, NotFound, Unauthorized } from "@tsed/exceptions";
import { ConnectionManager, getConnectionManager, getManager, getRepository } from "typeorm";
import { EntryNotFound } from "src/exceptions/EntryNotFound";
import { ForgotPasswordModel, ResendVerificationEmailModel, SignedAuthenticationJWTData, SignUpResponse, UpdatePasswordModel, VerificationData, VerifyOtpModel } from "src/models/Auth";
import { ForgottenPasswordOtpHash } from "src/entities/ForgottenPasswordOtpHash";
import { hotp } from 'otplib';
import { PendingAccountVerification } from "src/entities/PendingAccountVerification";
import { PlatformResponse, Service } from "@tsed/common";
import { sendEmail } from "src/utils/Mailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface LoggedInUserCookieData {
  at: string;
  r: AccountRole | AccountRole[];
  uid: string;
}

interface LoginFields {
  email: string;
  password: string;
}

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

  async signin(data: LoginFields): Promise<LoggedInUserCookieData> {
    try {
      let error: Exception = {} as Exception;
      const account = await this.accountService.getAccountByEmail(data.email);
      if (!account) {
        error = new NotFound('Cuenta no encontrada')
        error.errors = [{ code: 'E0001' }]
        throw (error)
      }
      if (!bcrypt.compareSync(data.password, account.password)) {
        error = new Unauthorized('Usuario o clave incorrecta.')
        error.errors = [{ code: 'E0002', message: 'Usuario o clave incorrecta.' }]
        throw (error)
      }
      if (!account?.isActive) {
        error = new Unauthorized('Esta cuenta no está activa!')
        error.errors = [{ code: 'E0003', message: 'Esta cuenta no está activa!' }]
        throw (error)
      }
      if (!account?.isVerified) {
        error = new Unauthorized('Esta cuenta no ha sido verificada!')
        error.errors = [{ code: 'E0004', message: 'Esta cuenta no ha sido verificada!' }]
        throw (error)
      }
      
      const accountRoles = await this.accountService.getAccountRoles(account.id);
      if (!accountRoles) {
        error = new Unauthorized('No se encontraron roles para esta cuenta!')
        error.errors = [{ code: 'E0005', message: 'No se encontraron roles para esta cuenta!' }]
        throw (error)
      }

      const signedData = { userId: account.id, role: accountRoles[0].roleName, email: data.email };

      if (!process.env.JWT_SECRET) {
        error = new BadRequest('No se pudo determinar las credenciale!')
        error.errors = [{ code: 'E0006', message: 'No se pudo determinar las credenciale!' }]
        throw (error)
      }
      const token = jwt.sign({ signedData }, process.env.JWT_SECRET, {
        expiresIn: Number(process.env.JWT_EXPIRESIN_LOGIN),
        algorithm: "HS512"
      });

      const loginRes: LoggedInUserCookieData = { at: token, r: accountRoles, uid: account.id }
      return loginRes
    } catch (e) {
      throw e;
    }
  }

  async signup(data: Account, response: PlatformResponse): Promise<SignUpResponse | undefined> {
    try {
      //data.phoneNumber = data.phoneNumber. includes('+') ? data.phoneNumber : '+' + data.phoneNumber
      let error: Exception = {} as Exception;
              
      const createdAccount = await this.accountService.createAccount(data, response);
      if (!createdAccount) {
        error = new BadRequest('Ocurrio un error al crear la cuenta')
        error.errors = [{ code: 'E0012' }]
        throw (error)
      }

      return createdAccount;
    }
    catch (e) {
      throw e
    }
  }

  async verify(verificationData: VerificationData, res: PlatformResponse): Promise<boolean> {
    try {
      let error: Exception = {} as Exception;
      const { accountId, accessToken } = verificationData;
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
          console.log('Showing alreadyVerified template because account.isVerified');
          return false
        } else {

          const pendingAccountVerification = await transactionalEntityManager.createQueryBuilder(PendingAccountVerification, "pendingAccountVerification")
          .where("pendingAccountVerification.accountId = :accountId")
          .setParameter("accountId", account.id)
          .getOne();

          if (!pendingAccountVerification) {
            const verificationExpired = await res.render('verificationExpired');
            console.log('Showing verificationExpired template because !pendingAccountVerification');
            return false
          }

          const dateNow = new Date().getTime().valueOf()
          const expiresAt = new Date(pendingAccountVerification.exp).getTime().valueOf()
          if (dateNow > expiresAt) {
            const verificationExpired = await res.render('verificationExpired');
            console.log('Showing verificationExpired template because dateNow > expiresAt');
            return false
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
            console.log('updateAccountIsVerifiedResult', updateAccountIsVerifiedResult)
            const deletePendingAccountVerificationResult = await transactionalEntityManager.createQueryBuilder(PendingAccountVerification, "pendingAccountVerification")
              .delete()
              .where("pendingAccountVerification.accountId = :id")
              .setParameter("id", accountId)
              .execute();
            console.log('deletePendingAccountVerificationResult', deletePendingAccountVerificationResult)
            const verificationSuccessful = await res.render('verificationSuccessful');
            console.log('Showing verificationSuccessful template');
            return false
          }
          else {
            const verificationExpired = await res.render('verificationExpired');
            console.log('Showing verificationExpired template because !accountId === decoded.signedData.userId && accessToken === pendingAccountVerification.accessToken');
            return false
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