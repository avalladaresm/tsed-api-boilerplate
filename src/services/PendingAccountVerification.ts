import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {MSSQL_DUP_ENTRY_ERROR_NUMBER} from "../constants/mssql_errors";
import {Account} from "../entities/Account";
import {AccountRole} from "../entities/AccountRole";
import { PendingAccountVerification } from "../entities/PendingAccountVerification";
import {DuplicateEntry} from "../exceptions/DuplicateEntry";
import {EntryNotFound} from "../exceptions/EntryNotFound";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager, getRepository} from "typeorm";

@Service()
export class PendingAccountVerificationService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();
  private accountRepository = getRepository(Account);
  private accountRoleRepository = getRepository(AccountRole);

  $afterRoutesInit(): void {
    this.connection = getConnectionManager();
  }

/*   async createPendingAccountVerification(data: PendingAccountVerification): Promise<PendingAccountVerification | undefined> {
    try {
      const pendingAccountVerification = await this.entityManager.insert(PendingAccountVerification, data);
      return pendingAccountVerification;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      throw e;
    }
  } */

  async getPendingAccountVerificationByAccountId(accountId: string): Promise<Account | undefined> {
    try {
      const account = await this.accountRepository.createQueryBuilder("pendingAccountVerification")
        .where("pendingAccountVerification.accountId = :accountId")
        .setParameter("accountId", accountId)
        .getOne();
      return account;
    } catch (e) {
      if (e?.name === "EntityNotFoundError") {
        throw new EntryNotFound(`Pending account verification for account with id: ${accountId} does not exist.`);
      }
      throw e;
    }
  }

  async deletePendingAccountVerification(id: string): Promise<DeleteResult> {
    try {
      const account = await this.entityManager
        .createQueryBuilder()
        .delete()
        .from(PendingAccountVerification)
        .where({accountId: id} as PendingAccountVerification)
        .execute();

      return account;
    } catch (e) {
      throw e;
    }
  }
}
