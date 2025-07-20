import IoRedis from "ioredis";
import Singleton from "../base/singleton";
import { logger } from "./log";

export class Redis extends Singleton {

	private ioRedis: IoRedis;

	public override initialize(): void {
		this.ioRedis = new IoRedis({
			host: process.env.REDIS_HOST,
			password: process.env.REDIS_PASSWORD,
			port: parseInt(process.env.REDIS_PORT, 10),
			family: parseInt(process.env.REDIS_FAMILY, 10),
			db: parseInt(process.env.REDIS_DB, 10),
			retryStrategy: (times) => {
				return Math.min(times * 50, 2000);
			}
		});

		this.ioRedis.ping((err, result) => {
			if (err) {
				logger.error("Failed to connect to Redis:", err);
			} else {
				console.log(`✅ Connecting redis on ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
			}
		});
	}

	public getConnection(): IoRedis {
		return this.ioRedis;
	}
}

export const redis: Redis = Redis.getInstance();
