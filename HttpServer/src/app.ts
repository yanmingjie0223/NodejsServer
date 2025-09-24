import express from 'express';
import cors from 'cors';
import { db, DB } from './manager/db';
import { redis, Redis } from './manager/redis';
import { logger, Logger } from './manager/log';
import router from './router';

/**
 * 优雅关闭，保证db和redis完整性
 */
async function onShutdown() {
	console.log("Received SIGINT signal, closing Redis And DB connection...");

	process.off('message', onProcessMessage);
	process.off('SIGINT', onShutdown);
	process.off('SIGTERM', onShutdown);
	process.off('SIGQUIT', onShutdown);

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

/**
 * 主函数
 */
export default function runApp() {
	DB.getInstance();
	Redis.getInstance();
	Logger.getInstance();

	const port = process.env.PORT;
	const app = express();
	app.use(cors());
	router(app);
	app.listen(port, () => {
		logger.info(`✅ Running on localhost:${port}`);
		if (process.send) {
			process.send('ready');
		}
	});
}
