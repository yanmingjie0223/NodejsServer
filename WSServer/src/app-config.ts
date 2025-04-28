import config from "@colyseus/tools";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom, logger, Server } from "colyseus";
import { AppRoom } from "./rooms/app-room";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import * as path from "path";
import { db, DB } from "./manager/db";
import { Config } from "./manager/cfg";

export default config({

	options: {
		logger: winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.json()
			),
			transports: [
				new DailyRotateFile({
					filename: path.join("./", 'logs', `%DATE%.log`),
					datePattern: 'YYYY-MM-DD-HH',
					zippedArchive: true,
					maxSize: '20m',
					maxFiles: '14d'
				}),
				new winston.transports.Console({
					format: winston.format.simple(),
				})
			],
		})
	},

	initializeTransport: (options) => new WebSocketTransport(options),

	initializeGameServer: (gameServer: Server) => {
		gameServer.define('app-room', AppRoom);
		gameServer.define('lobby', LobbyRoom);

		DB.getInstance();
		Config.getInstance();

		gameServer.onBeforeShutdown(async () => {
			try {
				const source = db.getConnection();
				if (source && source.isInitialized) {
					await source.destroy();
				}
			}
			catch (err) {
				logger.error("close error.", err);
			}
		});
	},

	initializeExpress: (app) => { },

	beforeListen: () => { },

});
