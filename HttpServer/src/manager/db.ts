import * as typeorm from "typeorm";
import { logger } from "./log";
import Singleton from "../base/singleton";
import { UserEntity } from "../model/user-entity";

export class DB extends Singleton {

	private ioDB: typeorm.DataSource;
	private readonly retryInterval = 5000;

	public override initialize(): void {
		this.tryConnect();
	}

	public getConnection(): typeorm.DataSource {
		return this.ioDB;
	}

	private tryConnect(): void {
		const source = new typeorm.DataSource({
			type: process.env.DB_TYPE as any,
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USER_NAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			charset: "utf8mb4",
			synchronize: true,
			logging: false,
			entities: [
				UserEntity,
			]
		});

		source.initialize()
			.then(() => {
				this.ioDB = source;
				logger.info(`✅ Connecting ${process.env.DB_TYPE} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
			})
			.catch((e: Error) => {
				logger.error('database startup failed:', e);
				logger.info(`Retrying database connection in ${this.retryInterval}ms...`);
				setTimeout(() => this.tryConnect(), this.retryInterval);
			});
	}

}

export const db: DB = DB.getInstance();
