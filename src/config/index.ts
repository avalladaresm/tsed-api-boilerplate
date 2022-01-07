import { join } from "path";
import { loggerConfig } from "./logger";
import typeormConfig from "../../ormconfig";
import { ConnectionOptions } from "typeorm";

export const rootDir = join(__dirname, "..");

export const config: Partial<TsED.Configuration> = {
	rootDir,
	logger: loggerConfig,
	typeorm: [typeormConfig] as ConnectionOptions[]
};
