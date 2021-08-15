import {Factory, Seeder} from "typeorm-seeding";
import {Connection} from "typeorm";
import {Role} from "../entities/Role";

export default class CreateRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values([{name: "admin"}, {name: "clientadmin"}])
      .execute();
  }
}
