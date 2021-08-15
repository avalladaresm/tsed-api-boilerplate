import {Factory, Seeder} from "typeorm-seeding";
import {Connection} from "typeorm";
import {Account} from "../entities/Account";
import faker from "faker";

export default class CreateAccounts implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Account)
      .values([
        {
          name: faker.name.firstName() + " " + faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          dob: new Date(faker.date.past()).toString(),
          country: faker.address.country(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          identificationDocument: faker.internet.userName(),
          identificationDocumentType: "Cédula"
        },
        {
          name: faker.name.firstName() + " " + faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          dob: new Date(faker.date.past()).toString(),
          country: faker.address.country(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          identificationDocument: faker.internet.userName(),
          identificationDocumentType: "Cédula"
        },
        {
          name: faker.name.firstName() + " " + faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          dob: new Date(faker.date.past()).toString(),
          country: faker.address.country(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          identificationDocument: faker.internet.userName(),
          identificationDocumentType: "Cédula"
        },
        {
          name: faker.name.firstName() + " " + faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          dob: new Date(faker.date.past()).toString(),
          country: faker.address.country(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          identificationDocument: faker.internet.userName(),
          identificationDocumentType: "Cédula"
        },
        {
          name: faker.name.firstName() + " " + faker.name.lastName(),
          phoneNumber: faker.phone.phoneNumber(),
          dob: new Date(faker.date.past()).toString(),
          country: faker.address.country(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          identificationDocument: faker.internet.userName(),
          identificationDocumentType: "Cédula"
        }
      ])
      .execute();
  }
}
