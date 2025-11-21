import fastify from 'fastify';
import { db, DB } from './manager/db';
import { redis, Redis } from './manager/redis';
import { logger, Logger } from './manager/log';
import router from './router';
import { parentPort } from 'worker_threads';
import cors from '@fastify/cors';

/**
 * 主函数
 */
export default async function runApp() {
	DB.getInstance();
	Redis.getInstance();
	Logger.getInstance();

	const port = +process.env.PORT;
	const app = fastify({ logger: false });

	app.register(cors, {
		origin: '*',
		methods: ['GET', 'PUT', 'POST'],
	});

	router(app);

	try {
		await app.listen({ port, host: '0.0.0.0' });

		if (typeof process.send === 'function') {
			process.send('ready');
		} else if (parentPort && typeof parentPort.postMessage === 'function') {
			parentPort.postMessage('ready');
		}

		logger.info(`✅ Running on localhost:${port}`);
	} catch (err) {
		logger.error('Failed to start server:', err);

		process.exit(1);
	}

}

/**
 * 监听关机处理
 */
export async function listenShutdown() {
	process.once('SIGINT', onShutdown);
	process.once('SIGTERM', onShutdown);
	process.once('SIGQUIT', onShutdown);
	process.on('message', onProcessMessage);
}

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
