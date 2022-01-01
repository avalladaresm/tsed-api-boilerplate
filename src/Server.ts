import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";
import "@tsed/typeorm";
import { config, rootDir } from "./config";
import {IndexCtrl} from "./controllers/pages/IndexController";
import "./filters/ResourceNotFoundFilter";
import { CustomNamingStrategy } from "./CustomNamingStrategy";

@Configuration({
	...config,
	acceptMimes: ["application/json"],
	httpPort: process.env.PORT || 4000,
	httpsPort: process.env.PORT,
	mount: {
		"/v1/docs": [`${rootDir}/controllers/**/*.ts`]
    "/": [IndexCtrl]
	componentsScan: [`${rootDir}/middlewares/**/*.ts`],
	swagger: [
		{
			path: "/v1/docs",
			specVersion: "3.0.1"
		}
	],
	views: {
		root: `${rootDir}/../views`,
		viewEngine: "ejs"
	},
	exclude: ["**/*.spec.ts"]
})
export class Server {
	@Inject()
	app: PlatformApplication;

	@Configuration()
	settings: Configuration;

	$beforeInit(): void {
		getConnectionOptions()
			.then((connectionOptions) =>
				createConnection({ ...connectionOptions, namingStrategy: new CustomNamingStrategy() })
			)
			.catch((err) => console.log("connection error: ", err));
	}

	$beforeRoutesInit(): void {
		this.app
			.use(cors())
			.use(cookieParser())
			.use(compress({}))
			.use(methodOverride())
			.use(bodyParser.json())
			.use(
				bodyParser.urlencoded({
					extended: true
				})
			);
	}
}
