import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import Singleton from "../base/singleton";
import * as path from "path";

export class Logger extends Singleton {

	private logger: winston.Logger;

	public override initialize(): void {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp({
					format: () => {
						const beijingTime = new Date((new Date()).getTime() + 8 * 3600 * 1000);
						const timestamp = beijingTime.toISOString().replace('T', ' ');
						return timestamp.replace(/\..+/, '');
					}
				}),
				winston.format.printf(
					(info) => {
						return `[${info.level}][${[info.timestamp]}] ${info.message}`;
					}
				),
				winston.format.errors({ stack: true })
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
		});
	}

	public trace(...args: Array<any>): void {
		this.logger.info(args);
	}

	public debug(...args: Array<any>): void {
		this.logger.debug(args);
	}

	public info(...args: Array<any>): void {
		this.logger.info(args);
	}

	public log(...args: Array<any>): void {
		this.logger.info(args);
	}

	public warn(...args: Array<any>): void {
		this.logger.warn(args);
	}

	public error(...args: Array<any>): void {
		this.logger.error(args);
	}

}

export const logger: Logger = Logger.getInstance();
