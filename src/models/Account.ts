import { Account } from "src/entities/Account";

export interface CreatedAccountResponse {
  account: Account;
  accessToken: string;
}