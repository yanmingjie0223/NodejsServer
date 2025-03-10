import IoRedis from "ioredis";
import { serverConfig } from "./server.config";

export class Redis {

    private static _instance: Redis;

    private ioRedis;

    public static getInstance(): Redis {
        if (!this._instance) {
            this._instance = new Redis();
            this._instance.initialize();
        }
        return this._instance;
    }

    public initialize(): void {
        this.ioRedis = new IoRedis({
            host: serverConfig.redis.host,
            password: serverConfig.redis.password,
            port: serverConfig.redis.port,
            family: serverConfig.redis.family,
            db: serverConfig.redis.db
        });
        console.log(`> Connecting redis on ${serverConfig.redis.host}:${serverConfig.redis.port}`);
    }

    public getConnection(): void {
        return this.ioRedis;
    }
}

export const redis: Redis = Redis.getInstance();
