import { db } from "./manager/db";
import polka from "polka";
import { urlencoded } from "body-parser";
import { serverConfig } from "./manager/server.config";
import { redis } from "./manager/redis";
import router from "./router";
import * as auth from "./util/auth";

// 数据库中间件
function dbMiddleware(req, res, next) {
	req.db = db.getConnection();
	next();
}

// redis中间件
function redisMiddleware(req, res, next) {
	req.redis = redis.getConnection();
	next();
}

// auth验证和数据处理
function authMiddleware(req, res, next) {
	req.auth = auth;
	next();
}

// Cross Region
function crossRegion(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, GET");
	next();
}

const app = router(polka())
	.use(urlencoded({ extended: true }))
	.use(dbMiddleware)
	.use(redisMiddleware)
	.use(authMiddleware)
	.use(crossRegion);

export default function runApp() {
	app.listen(serverConfig.port).then(_ => {
		console.log(`> Running on localhost:${serverConfig.port}`);
	});
};
