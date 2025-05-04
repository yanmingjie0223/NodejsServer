import { ServerResponse } from "http";
import * as typeorm from "typeorm";
import { Request } from "polka";
import IoRedis from "ioredis";
import { Logger } from "../manager/log";
import { Config } from "../manager/cfg";
import { Checkout } from "../manager/checkout";

/**
 * 请求: c2s请求数据
 */
export interface CRequest extends Request {
	db: typeorm.DataSource;
	redis: IoRedis;
	logger: Logger;
	config: Config;
	checkout: Checkout;
	body: Uint8Array;
}

/**
 * 回应: s2c回应数据
 */
export interface CResponse extends ServerResponse { }
