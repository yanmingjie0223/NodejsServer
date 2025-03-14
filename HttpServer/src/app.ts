import { DB } from "./manager/db";
import polka, { Next } from "polka";
import { urlencoded } from "body-parser";
import { serverConfig } from "./manager/server-config";
import { Redis } from "./manager/redis";
import router from "./router";
import { CRequest, CResponse } from "./interface/index";
import { Checkout } from "./manager/checkout";
import { Config } from "./manager/cfg";
import { Logger } from "./manager/log";

/**
 * 中间件绑定
 * @param req
 * @param res
 * @param next
 */
function middleware(req: CRequest, res: CResponse, next: Next) {
	req.db = DB.getInstance<DB>().getConnection();
	req.redis = Redis.getInstance<Redis>().getConnection();
	req.logger = Logger.getInstance();
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
function crossRegion(req: CRequest, res: CResponse, next: Next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, GET");
	next();
}

/**
 * 优雅关闭 Redis和db 连接
 */
process.on("SIGINT", async () => {
	console.log("Received SIGINT signal, closing Redis And DB connection...");
	try {
		const redis = Redis.getInstance<Redis>().getConnection();
		if (redis) {
			await redis.quit();
		}

		const db = DB.getInstance<DB>().getConnection();
		if (db && db.isInitialized) {
			await db.destroy();
		}
		console.log("close redis and db!");
	} catch (err) {
		Logger.getInstance<Logger>().error("Error closing Redis connection:", err);
		process.exit(1);
	} finally {
		process.exit(0);
	}
});

const app: polka.Polka = router(polka())
	.use(urlencoded({ extended: true }))
	.use(middleware as any)
	.use(crossRegion as any);

/**
 * 主函数
 */
export default function runApp() {
	app.listen(serverConfig.port, () => {
		console.log(`> Running on localhost:${serverConfig.port}`);
	});
};
