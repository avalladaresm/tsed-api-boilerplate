import {Factory, Seeder} from "typeorm-seeding";
import {Connection} from "typeorm";
import {AccountRole} from "../../entities/AccountRole";

export default class CreateAccountRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(AccountRole)
      .values([{name: "ADMIN"}, {name: "CLIENT"}])
      .execute();
  }
}
