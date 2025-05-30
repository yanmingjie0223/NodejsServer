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
 * 优雅关闭，保证db和redis完整性
 */
async function onShutdown() {
	console.log("Received SIGINT signal, closing Redis And DB connection...");

	process.off('message', onProcessMessage);
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
		console.error("Error closing Redis connection:", err);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

/**
 * 消息处理
 * @param msg
 */
async function onProcessMessage(msg: string) {
	if (msg === 'shutdown') {
		await onShutdown();
	}
}

process.once('SIGINT', onShutdown);
process.once('SIGTERM', onShutdown);
process.once('SIGQUIT', onShutdown);
process.on('message', onProcessMessage);
const app: polka.Polka = router(polka())
	.use(middlewareBuffer as any)
	.use(middleware as any)
	.use(crossRegion as any);

/**
 * 主函数
 */
export default function runApp() {
	app.listen(serverConfig.port, () => {
		console.log(`✅ Running on localhost:${serverConfig.port}`);
		if (process.send) {
			process.send('ready');
		}
	});
}
