import * as typeorm from "typeorm";
import { serverConfig } from "./server-config";
import { Logger } from "./log";
import userSchema from "../model/user-schema";
import Singleton from "../base/singleton";

export class DB extends Singleton {

	private ioDB: typeorm.DataSource;

	public override initialize(): void {
		const source = new typeorm.DataSource({
			type: serverConfig.db.type,
			host: serverConfig.db.host,
			port: serverConfig.db.port,
			username: serverConfig.db.username,
			password: serverConfig.db.password,
			database: serverConfig.db.database,
			synchronize: true,
			logging: false,
			entities: [
				userSchema,
			]
		});
		source.initialize()
			.then(() => {
				this.ioDB = source;
				console.log(`> Connecting ${serverConfig.db.type} on ${serverConfig.db.host}:${serverConfig.db.port}`);
			})
			.catch((e: Error) => {
				Logger.getInstance<Logger>().error('数据库启动失败:', e);
			});
	}

	public getConnection(): typeorm.DataSource {
		return this.ioDB;
	}

}

export const db: DB = DB.getInstance();
