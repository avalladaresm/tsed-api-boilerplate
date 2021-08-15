import {Configuration, registerProvider} from "@tsed/di";
import {createConnection} from "@tsed/typeorm";
import {CustomNamingStrategy} from "src/CustomNamingStrategy";
import {Connection, getConnectionOptions} from "typeorm";
export const DEFAULT_CONNECTION = Symbol.for("DEFAULT_CONNECTION");
export type DEFAULT_CONNECTION = Connection;

registerProvider({
  provide: DEFAULT_CONNECTION,
  deps: [Configuration],
  async useAsyncFactory() {
    // https://typeorm.io/#/using-ormconfig/overriding-options-defined-in-ormconfig
    const connectionOptions = await getConnectionOptions();
    return createConnection({...connectionOptions, namingStrategy: new CustomNamingStrategy()});
  }
});
