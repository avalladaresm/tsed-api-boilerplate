import {Controller, Get} from "@tsed/common";
import {Returns, Security} from "@tsed/schema";
import {Account} from "src/entities/Account";
import {AccountService} from "src/services/Account";

@Controller("/accounts")
export class AccountController {
  constructor(private accountervice: AccountService) {}

  @Get("/")
  @(Returns(200, Account).Description("An array of Account"))
  @Security("calendar_auth", "write:calendar", "read:calendar")
  async getAllAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.accountervice.getAllAccounts();
      return accounts;
    } catch (e) {
      throw e;
    }
  }
}
