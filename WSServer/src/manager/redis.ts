import IoRedis from "ioredis";
import Singleton from "../base/singleton";
import { logger } from "colyseus";

export class Redis extends Singleton {

	private ioRedis: IoRedis;
	private reconnectTimer?: NodeJS.Timeout;
	private reconnectInterval: number = 5000;

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

		this.ioRedis.on("error", (err) => {
			logger.error("Redis error:", err);
			this.scheduleReconnect();
		});
		this.ioRedis.on("end", () => {
			logger.warn("Redis connection ended");
			this.scheduleReconnect();
		});
		this.ioRedis.on("close", () => {
			logger.warn("Redis connection closed");
			this.scheduleReconnect();
		});
		this.ioRedis.on("ready", () => {
			logger.info(`✅ Connected redis on ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
			this.clearReconnect();
		});
	}

	public getConnection(): IoRedis {
		return this.ioRedis;
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) {
			return;
		}

		logger.info(`Scheduling Redis reconnect every ${this.reconnectInterval}ms`);

		this.reconnectTimer = setInterval(() => {
			// 仅在非就绪状态时尝试连接
			const status = (this.ioRedis && this.ioRedis.status) || "";
			if (status === 'ready') {
				this.clearReconnect();
				return;
			}

			try {
				const conn = this.ioRedis.connect();
				if (conn && typeof conn.then === "function") {
					conn.catch((err: any) => logger.debug("Redis reconnect attempt failed:", err));
				}
			} catch (err) {
				logger.debug("Redis reconnect attempt threw:", err);
			}
		}, this.reconnectInterval);
	}

	private clearReconnect(): void {
		if (this.reconnectTimer) {
			clearInterval(this.reconnectTimer);
			this.reconnectTimer = undefined;
			logger.info("Cleared Redis reconnect timer");
		}
	}

}

export const pubsubRedis: Redis = new Redis();
export const redis: Redis = Redis.getInstance();
