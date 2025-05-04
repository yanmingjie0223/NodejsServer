import { db } from "./manager/db";
import polka, { Next } from "polka";
import { serverConfig } from "./manager/server-config";
import { redis } from "./manager/redis";
import router from "./router";
import { CRequest, CResponse } from "./interface/index";
import { Checkout } from "./manager/checkout";
import { Config } from "./manager/cfg";
import { logger } from "./manager/log";

/**
 * 中间件绑定
 * @param req
 * @param res
 * @param next
 */
function middleware(req: CRequest, res: CResponse, next: Next): void {
	req.db = db.getConnection();
	req.redis = redis.getConnection();
	req.logger = logger;
	req.config = Config.getInstance();
	req.checkout = Checkout.getInstance();
	next();
}

/**
 * Cross Region
 * @param req
 * @param res
 * @param next
 */
function crossRegion(req: CRequest, res: CResponse, next: Next): void {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, GET");
	next();
}

/**
 * buffer转换中间件
 * @param req
 * @param res
 * @param next
 */
function middlewareBuffer(req: CRequest, res: CResponse, next: Next) {
	const chunks = [];
	req.on("data", (chunk) => {
		chunks.push(chunk);
	});
	req.on("end", () => {
		const buffer = Buffer.concat(chunks);
		req.body = new Uint8Array(buffer);
		next();
	});
	req.on("error", () => {
		next();
	});
}

/**
 * 优雅关闭 Redis和db 连接
 */
process.on("SIGINT", async () => {
	console.log("Received SIGINT signal, closing Redis And DB connection...");
	try {
		const ioredis = redis.getConnection();
		if (ioredis) {
			await ioredis.quit();
		}

		const source = db.getConnection();
		if (source && source.isInitialized) {
			await source.destroy();
		}
		console.log("close redis and db!");
	} catch (err) {
		logger.error("Error closing Redis connection:", err);
		process.exit(1);
	} finally {
		process.exit(0);
	}
});

const app: polka.Polka = router(polka())
	.use(middlewareBuffer as any)
	.use(middleware as any)
	.use(crossRegion as any);

/**
 * 主函数
 */
export default function runApp() {
	app.listen(serverConfig.port, () => {
		console.log(`> Running on localhost:${serverConfig.port}`);
	});
}
