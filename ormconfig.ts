import { CustomNamingStrategy } from "./src/CustomNamingStrategy";

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
	entities: [process.env.API_TYPEORM_ENTITIES],
	migrations: [process.env.API_TYPEORM_MIGRATIONS],
	seeds: [process.env.API_TYPEORM_SEEDS],
	cli: {
		entitiesDir: process.env.API_TYPEORM_ENTITIES_DIR,
		migrationsDir: process.env.API_TYPEORM_MIGRATIONS_DIR
	},
	namingStrategy: new CustomNamingStrategy()
};
