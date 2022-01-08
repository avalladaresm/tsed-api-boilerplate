import { CustomNamingStrategy } from "./CustomNamingStrategy";
import * as entities  from "./entities"
import * as migrations  from "./migrations"
import * as seeds  from "./seeds"
import {join} from "path";
const rootDir = __dirname

const toRootDir = (path: any) => join(rootDir, String(path))

export default {
	name: "default",
	type: process.env.API_TYPEORM_CONNECTION,
	host: process.env.API_TYPEORM_HOST,
	username: process.env.API_TYPEORM_USERNAME,
	password: process.env.API_TYPEORM_PASSWORD,
	database: process.env.API_TYPEORM_DATABASE,
	port: Number(process.env.API_TYPEORM_PORT),
	synchronize: process.env.API_TYPEORM_SYNCHRONIZE,
	logging: process.env.API_TYPEORM_LOGGING,
	logger: process.env.API_TYPEORM_LOGGER,
	entities: [...Object.values(entities)],
	migrations: [...Object.values(migrations)],
	seeds: [...Object.values(seeds)],
	cli: {
		entitiesDir: toRootDir(process.env.API_TYPEORM_ENTITIES_DIR),
		migrationsDir: toRootDir(process.env.API_TYPEORM_MIGRATIONS_DIR)
	},
	namingStrategy: new CustomNamingStrategy(),
	options: {
		useUTC: true,
	}
};