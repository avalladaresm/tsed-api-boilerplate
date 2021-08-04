import {Service} from "@tsed/common";
import {TypeORMService} from "@tsed/typeorm";
import {Account} from "src/entities/Account";
import {Connection, getManager} from "typeorm";

@Service()
export class AccountService {
  private connection: Connection;
  constructor(private typeORMService: TypeORMService) {}
  private entityManager = getManager();

  $afterRoutesInit(): void {
    this.connection = this.typeORMService.get("default")!;
  }

  async getAllAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.entityManager.find(Account);
      return accounts;
    } catch (e) {
      throw e;
    }
  }
}
