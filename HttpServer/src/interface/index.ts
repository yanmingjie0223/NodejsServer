import { ServerResponse } from "http";
import * as typeorm from "typeorm";
import { Request } from "polka";
import IoRedis from "ioredis";
import { Logger } from "../manager/log";
import { Config } from "../manager/cfg";
import { Checkout } from "../manager/checkout";

export interface CRequest extends Request {
	db: typeorm.DataSource;
	redis: IoRedis;
	logger: Logger;
	config: Config;
	checkout: Checkout;
	body: { data: string };
}

export interface CResponse extends ServerResponse { }
