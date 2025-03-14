import IoRedis from "ioredis";
import { serverConfig } from "./server-config";
import Singleton from "../base/singleton";
import { Logger } from "./log";

export class Redis extends Singleton {

	private ioRedis: IoRedis;

	public override initialize(): void {
		this.ioRedis = new IoRedis({
			host: serverConfig.redis.host,
			password: serverConfig.redis.password,
			port: serverConfig.redis.port,
			family: serverConfig.redis.family,
			db: serverConfig.redis.db,
			retryStrategy: (times) => {
				return Math.min(times * 50, 2000);
			}
		});

		this.ioRedis.ping((err, result) => {
			if (err) {
				Logger.getInstance<Logger>().error("Failed to connect to Redis:", err);
			} else {
				console.log(`> Connecting redis on ${serverConfig.redis.host}:${serverConfig.redis.port}`);
			}
		});
	}

	public getConnection(): IoRedis {
		return this.ioRedis;
	}
}

export const redis: Redis = Redis.getInstance();
