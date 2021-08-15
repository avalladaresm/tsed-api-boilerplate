import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {MSSQL_DUP_ENTRY_ERROR_NUMBER} from "src/constants/mssql_errors";
import {Account} from "src/entities/Account";
import {AccountRole} from "src/entities/AccountRole";
import {DuplicateEntry} from "src/exceptions/DuplicateEntry";
import {EntryNotFound} from "src/exceptions/EntryNotFound";
import {ConnectionManager, DeleteResult, getConnectionManager, getManager} from "typeorm";

@Service()
export class AccountService {
  private connection: ConnectionManager;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

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

  async createAccount(data: Account): Promise<Account> {
    try {
      const createdAccount = await getManager().transaction(async (transactionalEntityManager) => {
        const account = await transactionalEntityManager.insert(Account, data);
        const roles = ["admin", "client"];
        const accountRoles: AccountRole[] = [];
        for (const role of roles) {
          const _accountRole = await transactionalEntityManager.insert(AccountRole, {
            roleName: role,
            accountId: account.generatedMaps[0].id
          });
          accountRoles.push(_accountRole.generatedMaps[0] as AccountRole);
        }
        return account;
      });

      const _createdAccount = await this.entityManager.findOneOrFail(Account, createdAccount.generatedMaps[0].id, {
        relations: ["accountRoles"]
      });
      return _createdAccount;
    } catch (e) {
      if (e?.number === MSSQL_DUP_ENTRY_ERROR_NUMBER) {
        throw new DuplicateEntry(e?.message);
      }
      throw e;
    }
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    try {
      const account = await this.entityManager.findOneOrFail(Account, id);
      return account;
    } catch (e) {
      if (e?.name === "EntityNotFoundError") {
        throw new EntryNotFound(`Account with id: ${id} does not exist.`);
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
}
