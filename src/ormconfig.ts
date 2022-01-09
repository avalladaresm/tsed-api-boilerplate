import { join } from "path";
import { CustomNamingStrategy } from "./CustomNamingStrategy";

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
	entities: process.env.NODE_ENV !== "production" ? [join(__dirname, process.env.DEV_API_TYPEORM_ENTITIES!)] : [join(__dirname, process.env.API_TYPEORM_ENTITIES!)],
	migrations: process.env.NODE_ENV !== "production" ? [join(__dirname, process.env.DEV_API_TYPEORM_MIGRATIONS!)] : [join(__dirname, process.env.API_TYPEORM_MIGRATIONS!)],
	seeds: process.env.NODE_ENV !== "production" ? [join(__dirname, process.env.DEV_API_TYPEORM_SEEDS!)] : [join(__dirname, process.env.API_TYPEORM_SEEDS!)],
	cli: {
		entitiesDir: process.env.API_TYPEORM_ENTITIES_DIR,
		migrationsDir: process.env.API_TYPEORM_MIGRATIONS_DIR
	},
	namingStrategy: new CustomNamingStrategy(),
	options: {
		useUTC: true,
	}
};
