import * as typeorm from "typeorm";
import { serverConfig } from "./server-config";
import { logger } from "./log";
import Singleton from "../base/singleton";
import { UserEntity } from "../model/user-entity";

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
				UserEntity,
			]
		});
		source.initialize()
			.then(() => {
				this.ioDB = source;
				console.log(`> Connecting ${serverConfig.db.type} on ${serverConfig.db.host}:${serverConfig.db.port}`);
			})
			.catch((e: Error) => {
				logger.error('database startup failed:', e);
			});
	}

	public getConnection(): typeorm.DataSource {
		return this.ioDB;
	}

}

export const db: DB = DB.getInstance();
